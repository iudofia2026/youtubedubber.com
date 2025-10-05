"""
Job management router
Handles video processing job creation, status, and downloads
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional
import uuid
import os
from datetime import datetime

from app.services.stt import STTService
from app.services.mt import MTService
from app.services.tts import TTSService
from app.services.align import AlignmentService
from app.services.mix import MixingService
from app.services.export import ExportService

router = APIRouter()

# In-memory job storage (replace with database in production)
jobs_db = {}


class JobStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@router.post("/jobs")
async def create_job(
    background_tasks: BackgroundTasks,
    voice_file: UploadFile = File(..., description="Voice-only audio file"),
    bed_file: UploadFile = File(..., description="Background music/bed audio file"),
    languages: str = Form(..., description="Comma-separated list of target languages (e.g., 'es-ES,fr-FR,de-DE')"),
    source_language: str = Form(default="en-US", description="Source language of the voice file")
):
    """Create a new dubbing job"""
    
    # Validate file types
    if not voice_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Voice file must be an audio file")
    
    if not bed_file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Bed file must be an audio file")
    
    # Parse languages
    target_languages = [lang.strip() for lang in languages.split(",")]
    if not target_languages:
        raise HTTPException(status_code=400, detail="At least one target language must be specified")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job directory
    job_dir = f"outputs/{job_id}"
    os.makedirs(job_dir, exist_ok=True)
    
    # Save uploaded files
    voice_path = f"{job_dir}/voice_original.m4a"
    bed_path = f"{job_dir}/bed_original.m4a"
    
    with open(voice_path, "wb") as f:
        content = await voice_file.read()
        f.write(content)
    
    with open(bed_path, "wb") as f:
        content = await bed_file.read()
        f.write(content)
    
    # Create job record
    job = {
        "id": job_id,
        "status": JobStatus.PENDING,
        "created_at": datetime.utcnow().isoformat(),
        "source_language": source_language,
        "target_languages": target_languages,
        "voice_file": voice_path,
        "bed_file": bed_path,
        "outputs": {},
        "error": None
    }
    
    jobs_db[job_id] = job
    
    # Start background processing
    background_tasks.add_task(process_job, job_id)
    
    return {
        "job_id": job_id,
        "status": job["status"],
        "message": "Job created successfully. Processing will begin shortly."
    }


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get job status and progress"""
    
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    
    return {
        "job_id": job_id,
        "status": job["status"],
        "created_at": job["created_at"],
        "source_language": job["source_language"],
        "target_languages": job["target_languages"],
        "outputs": job["outputs"],
        "error": job.get("error")
    }


@router.get("/jobs/{job_id}/download")
async def download_job_output(
    job_id: str,
    lang: str,
    type: str = "full"  # full, voice, captions
):
    """Download job output files"""
    
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    
    if job["status"] != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    if lang not in job["outputs"]:
        raise HTTPException(status_code=404, detail="Language not found in job outputs")
    
    lang_outputs = job["outputs"][lang]
    
    if type == "full" and "full_mix" in lang_outputs:
        file_path = lang_outputs["full_mix"]
    elif type == "voice" and "voice_only" in lang_outputs:
        file_path = lang_outputs["voice_only"]
    elif type == "captions" and "captions" in lang_outputs:
        file_path = lang_outputs["captions"]
    else:
        raise HTTPException(status_code=404, detail=f"File type '{type}' not found for language '{lang}'")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        file_path,
        media_type="audio/mp4" if type != "captions" else "text/plain",
        filename=f"{job_id}-{lang}-{type}.{'m4a' if type != 'captions' else 'srt'}"
    )


async def process_job(job_id: str):
    """Process a dubbing job in the background"""
    
    job = jobs_db[job_id]
    job["status"] = JobStatus.PROCESSING
    
    try:
        # Initialize services
        stt_service = STTService()
        mt_service = MTService()
        tts_service = TTSService()
        align_service = AlignmentService()
        mix_service = MixingService()
        export_service = ExportService()
        
        # Step 1: Speech-to-Text
        print(f"🎤 Processing STT for job {job_id}")
        transcript = await stt_service.transcribe(job["voice_file"], job["source_language"])
        
        # Step 2: Process each target language
        for target_lang in job["target_languages"]:
            print(f"🌍 Processing language {target_lang} for job {job_id}")
            
            # Translate transcript
            translated_text = await mt_service.translate(transcript, job["source_language"], target_lang)
            
            # Generate speech
            voice_file = await tts_service.synthesize(translated_text, target_lang)
            
            # Align with original timing
            aligned_voice = await align_service.align_audio(
                job["voice_file"], 
                voice_file, 
                transcript, 
                translated_text
            )
            
            # Mix with background
            full_mix = await mix_service.mix_audio(aligned_voice, job["bed_file"])
            
            # Export files
            outputs = await export_service.export_job(
                job_id, 
                target_lang, 
                aligned_voice, 
                full_mix, 
                translated_text
            )
            
            job["outputs"][target_lang] = outputs
        
        job["status"] = JobStatus.COMPLETED
        print(f"✅ Job {job_id} completed successfully")
        
    except Exception as e:
        job["status"] = JobStatus.FAILED
        job["error"] = str(e)
        print(f"❌ Job {job_id} failed: {e}")


@router.get("/jobs")
async def list_jobs(limit: int = 10, offset: int = 0):
    """List all jobs with pagination"""
    
    job_list = list(jobs_db.values())
    total = len(job_list)
    
    # Simple pagination
    start = offset
    end = offset + limit
    paginated_jobs = job_list[start:end]
    
    return {
        "jobs": paginated_jobs,
        "total": total,
        "limit": limit,
        "offset": offset
    }
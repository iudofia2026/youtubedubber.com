"""
Background job processor for handling dubbing jobs
"""
import asyncio
import logging
import tempfile
import os
import subprocess
from typing import List
from app.database import SessionLocal
from app.models import DubbingJob, LanguageTask, JobStatus, LanguageTaskStatus
from app.services.job_service import JobService
from app.services.ai_service import AIService
from app.services.storage_service import StorageService
from app.config import settings
import uuid

logger = logging.getLogger(__name__)


class JobProcessor:
    """Background job processor for dubbing jobs"""
    
    def __init__(self):
        self.job_service = JobService()
        self.ai_service = AIService()
        self.storage_service = StorageService()
        self.running = False
        self.max_concurrent_jobs = settings.max_concurrent_jobs
        self.poll_interval = settings.worker_poll_interval
    
    async def start(self):
        """Start the background worker"""
        self.running = True
        logger.info("Job processor started")
        
        try:
            while self.running:
                await self.process_pending_jobs()
                await asyncio.sleep(self.poll_interval)
        except Exception as e:
            logger.error(f"Error in job processor main loop: {e}")
        finally:
            logger.info("Job processor stopped")
    
    async def stop(self):
        """Stop the background worker"""
        self.running = False
        logger.info("Job processor stopping...")
    
    async def process_pending_jobs(self):
        """Process pending jobs"""
        try:
            db = SessionLocal()
            try:
                # Get pending jobs
                jobs = await self.job_service.get_pending_jobs(db)
                
                if not jobs:
                    return
                
                logger.info(f"Found {len(jobs)} pending jobs")
                
                # Process jobs (limit concurrent processing)
                active_jobs = []
                for job in jobs[:self.max_concurrent_jobs]:
                    if self.running:
                        task = asyncio.create_task(self.process_job(job, db))
                        active_jobs.append(task)
                
                # Wait for all active jobs to complete
                if active_jobs:
                    await asyncio.gather(*active_jobs, return_exceptions=True)
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error processing pending jobs: {e}")
    
    async def process_job(self, job: DubbingJob, db):
        """Process a single dubbing job"""
        job_id = job.id
        logger.info(f"Processing job {job_id}")
        
        try:
            # Update job status to processing
            await self.job_service.update_job_status(
                job_id, JobStatus.PROCESSING, "Starting job processing...", db
            )
            
            # Get language tasks for this job
            language_tasks = db.query(LanguageTask).filter(
                LanguageTask.job_id == job_id
            ).all()
            
            if not language_tasks:
                logger.warning(f"No language tasks found for job {job_id}")
                await self.job_service.update_job_status(
                    job_id, JobStatus.ERROR, "No language tasks found", db
                )
                return
            
            # Process each language task
            for task in language_tasks:
                if not self.running:
                    break
                
                await self.process_language_task(job, task, db)
            
            # Check if all tasks are complete
            completed_tasks = db.query(LanguageTask).filter(
                LanguageTask.job_id == job_id,
                LanguageTask.status == LanguageTaskStatus.COMPLETE
            ).count()
            
            total_tasks = len(language_tasks)
            
            if completed_tasks == total_tasks:
                await self.job_service.update_job_status(
                    job_id, JobStatus.COMPLETE, "All language tasks completed successfully", db
                )
                logger.info(f"Job {job_id} completed successfully")
            else:
                failed_tasks = total_tasks - completed_tasks
                await self.job_service.update_job_status(
                    job_id, JobStatus.ERROR, f"{failed_tasks} language tasks failed", db
                )
                logger.warning(f"Job {job_id} completed with {failed_tasks} failed tasks")
            
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}")
            await self.job_service.update_job_status(
                job_id, JobStatus.ERROR, f"Job processing failed: {str(e)}", db
            )
    
    async def process_language_task(self, job: DubbingJob, task: LanguageTask, db):
        """Process a single language task"""
        task_id = task.id
        language_code = task.language_code
        job_id = job.id
        
        logger.info(f"Processing language task {task_id} for language {language_code}")
        
        try:
            # Update task status to processing
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 0, "Starting language processing...", db=db
            )
            
            # Download voice track from storage
            voice_track_path = await self.download_voice_track(job)
            if not voice_track_path:
                raise Exception("Failed to download voice track")
            
            # Process the media file (extract audio if it's video)
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 10, "Processing media file...", db=db
            )
            
            processed_audio_path = await self.process_media_file(voice_track_path)
            
            # Process the audio file
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 25, "Transcribing audio...", db=db
            )
            
            # Transcribe audio
            transcription_result = await self.ai_service.transcribe_audio(
                processed_audio_path, "en"  # Assuming source language is English
            )
            
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 50, "Translating transcript...", db=db
            )
            
            # Translate transcript
            translated_text = await self.ai_service.translate_text(
                transcription_result["transcript"],
                language_code,
                "en"
            )
            
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 75, "Generating speech...", db=db
            )
            
            # Generate speech
            speech_audio = await self.ai_service.generate_speech(
                translated_text, language_code
            )

            # TODO: Add audio mixing with background track if present
            # If job.background_track_url exists:
            #   1. Download background track
            #   2. Save speech_audio to temp file
            #   3. Use ai_service.mix_audio_tracks() to combine them
            #   4. Upload mixed audio instead of speech_audio alone
            # This would provide a complete dubbed experience with music/ambient audio

            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.PROCESSING, 90, "Uploading generated audio...", db=db
            )

            # Save generated audio to storage
            audio_filename = f"dubbed_{language_code}_{uuid.uuid4().hex[:8]}.mp3"
            audio_path = self.storage_service.get_artifact_path(
                job.user_id, job_id, language_code, "audio", audio_filename
            )

            # Upload audio bytes to Supabase Storage
            logger.info(f"Uploading generated audio to: {audio_path}")
            public_url = await self.storage_service.upload_file(
                file_path=audio_path,
                file_data=speech_audio,
                content_type="audio/mpeg"
            )

            logger.info(f"Generated audio uploaded successfully to: {public_url}")

            # Update task with results
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.COMPLETE, 100,
                "Language processing completed successfully",
                download_url=public_url, db=db
            )
            
            # Clean up temporary files
            if os.path.exists(voice_track_path):
                os.remove(voice_track_path)
            if processed_audio_path != voice_track_path and os.path.exists(processed_audio_path):
                os.remove(processed_audio_path)
            
            logger.info(f"Language task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error processing language task {task_id}: {e}")
            await self.job_service.update_language_task_status(
                task_id, LanguageTaskStatus.ERROR, 0, f"Language processing failed: {str(e)}", db=db
            )
    
    async def download_voice_track(self, job: DubbingJob) -> str:
        """Download voice track from storage to temporary file"""
        try:
            if not job.voice_track_url:
                raise Exception("No voice track URL found")

            logger.info(f"Downloading voice track from: {job.voice_track_url}")

            # Download file from Supabase Storage
            file_data = await self.storage_service.download_file(job.voice_track_url)

            # Determine file extension from URL
            file_ext = os.path.splitext(job.voice_track_url)[1] or ".mp3"

            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix=file_ext, delete=False)
            temp_file.write(file_data)
            temp_file.close()

            logger.info(f"Downloaded voice track to: {temp_file.name}")
            return temp_file.name

        except Exception as e:
            logger.error(f"Error downloading voice track: {e}", exc_info=True)
            return None
    
    async def extract_audio_from_video(self, video_path: str) -> str:
        """Extract audio from MP4 video file using FFmpeg"""
        try:
            # Create temporary audio file
            audio_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            audio_file.close()
            
            # Use FFmpeg to extract audio from video
            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-vn",  # No video
                "-acodec", "pcm_s16le",  # Audio codec
                "-ar", "44100",  # Sample rate
                "-ac", "2",  # Stereo
                "-y",  # Overwrite output file
                audio_file.name
            ]
            
            logger.info(f"Extracting audio from video: {video_path}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                logger.error(f"FFmpeg error: {result.stderr}")
                raise Exception(f"Failed to extract audio from video: {result.stderr}")
            
            logger.info(f"Successfully extracted audio to: {audio_file.name}")
            return audio_file.name
            
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg extraction timed out")
            raise Exception("Video processing timed out")
        except Exception as e:
            logger.error(f"Error extracting audio from video: {e}")
            raise Exception(f"Failed to extract audio from video: {str(e)}")
    
    async def process_media_file(self, file_path: str) -> str:
        """Process media file (audio or video) and return audio file path"""
        try:
            file_ext = os.path.splitext(file_path)[1].lower()
            
            if file_ext == '.mp4':
                # Extract audio from video
                logger.info(f"Processing MP4 video file: {file_path}")
                return await self.extract_audio_from_video(file_path)
            else:
                # File is already audio, return as-is
                logger.info(f"Processing audio file: {file_path}")
                return file_path
                
        except Exception as e:
            logger.error(f"Error processing media file: {e}")
            raise Exception(f"Failed to process media file: {str(e)}")


async def main():
    """Main function to run the job processor"""
    processor = JobProcessor()
    
    try:
        await processor.start()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    finally:
        await processor.stop()


if __name__ == "__main__":
    asyncio.run(main())
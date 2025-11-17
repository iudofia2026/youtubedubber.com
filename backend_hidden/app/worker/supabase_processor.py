#!/usr/bin/env python3
"""
Supabase-based job processor for handling dubbing jobs
"""
import asyncio
import logging
import os
import tempfile
from pathlib import Path
from typing import List
from app.services.supabase_job_service import SupabaseJobService
from app.services.supabase_db_service import SupabaseDBService
from app.services.ai_service import AIService
from app.services.storage_service import StorageService
from app.auth import SupabaseStorageService
from app.config import settings
from app.schemas import LanguageTaskStatus
import uuid

logger = logging.getLogger(__name__)


class SupabaseJobProcessor:
    """Background job processor for dubbing jobs using Supabase REST API"""
    
    def __init__(self):
        self.job_service = SupabaseJobService()
        self.db_service = SupabaseDBService()
        self.ai_service = AIService()
        self.storage_service = StorageService()
        self.supabase_storage = SupabaseStorageService()
        self.bucket = settings.storage_bucket
        self.running = False
        self.poll_interval = 5  # Check every 5 seconds
    
    async def start(self):
        """Start the background worker"""
        self.running = True
        logger.info("Supabase job processor started")
        
        try:
            while self.running:
                await self.process_pending_jobs()
                await asyncio.sleep(self.poll_interval)
        except Exception as e:
            logger.error(f"Error in job processor main loop: {e}")
        finally:
            logger.info("Supabase job processor stopped")
    
    async def stop(self):
        """Stop the background worker"""
        self.running = False
        logger.info("Supabase job processor stopping...")
    
    async def process_pending_jobs(self):
        """Process pending jobs"""
        try:
            # Get pending jobs from Supabase
            jobs = await self.get_pending_jobs()
            
            if not jobs:
                return
            
            logger.info(f"Found {len(jobs)} pending jobs")
            
            # Process jobs one by one for now
            for job in jobs:
                if self.running:
                    try:
                        await self.process_job(job)
                    except Exception as e:
                        logger.error(f"Error processing job {job.get('id', 'unknown')}: {e}")
                        
        except Exception as e:
            logger.error(f"Error processing pending jobs: {e}")
    
    async def get_pending_jobs(self):
        """Get pending jobs from Supabase"""
        try:
            # Get jobs with status 'processing' that have pending language tasks
            jobs = self.db_service.get_jobs_by_status("processing")
            
            pending_jobs = []
            for job in jobs:
                # Check if this job has pending language tasks
                tasks = self.db_service.get_language_tasks_by_job_id(job['id'])
                pending_tasks = [task for task in tasks if task.get('status') == 'pending']
                
                if pending_tasks:
                    pending_jobs.append(job)
            
            return pending_jobs
            
        except Exception as e:
            logger.error(f"Error getting pending jobs: {e}")
            return []
    
    async def process_job(self, job):
        """Process a single dubbing job"""
        job_id = job['id']
        user_id = job['user_id']
        
        logger.info(f"Processing job {job_id} for user {user_id}")
        
        # Log job processing start
        upload_log_path = Path("uploads.log")
        with open(upload_log_path, "a") as log_file:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_file.write(f"[{timestamp}] JOB_PROCESSING: {job_id} | User: {user_id} | Status: Started processing\n")
        
        try:
            # Get language tasks for this job
            tasks = self.db_service.get_language_tasks_by_job_id(job_id)
            pending_tasks = [task for task in tasks if task.get('status') == 'pending']
            
            if not pending_tasks:
                logger.info(f"No pending tasks for job {job_id}")
                return
            
            # Process each pending language task
            for task in pending_tasks:
                await self.process_language_task(job, task)
                
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}")
            # Update job status to error
            await self.update_job_status(job_id, "error", 0, f"Processing failed: {str(e)}")
    
    async def process_language_task(self, job, task):
        """Process a single language task"""
        task_id = task['id']
        job_id = job['id']
        language_code = task['language_code']
        
        logger.info(f"Processing language task {task_id} for language {language_code}")
        
        try:
            # Update task status to processing
            await self.update_language_task_status(task_id, "processing", 10, "Starting processing...")

            # Download the voice track from Supabase Storage
            if not job.get('voice_track_url'):
                raise Exception("Voice track URL not found in job data")

            voice_track_path = await self.download_file_from_storage(job['voice_track_url'], "voice")
            if not voice_track_path:
                raise Exception("Failed to download voice track from storage")

            logger.info(f"Downloaded voice track to: {voice_track_path}")
            
            # Log file processing
            upload_log_path = Path("uploads.log")
            with open(upload_log_path, "a") as log_file:
                from datetime import datetime
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                log_file.write(f"[{timestamp}] FILE_PROCESSING: {voice_track_path} | Language: {language_code} | Task: {task_id}\n")
            
            # Update task status
            await self.update_language_task_status(task_id, "processing", 25, "Transcribing audio...")
            
            # Transcribe the actual audio file using Deepgram
            logger.info(f"Transcribing audio file: {voice_track_path}")
            transcription_result = await self.ai_service.transcribe_audio(voice_track_path, "en")

            # Extract transcript text from result dict
            if isinstance(transcription_result, dict):
                transcribed_text = transcription_result["transcript"]
                confidence = transcription_result.get("confidence", 0)
                logger.info(f"Transcription confidence: {confidence:.2%}")
            else:
                # Fallback for old string return type
                transcribed_text = transcription_result

            logger.info(f"Transcribed text ({len(transcribed_text)} chars): {transcribed_text[:100]}...")
            
            # Update task status
            await self.update_language_task_status(task_id, "processing", 50, "Translating text...")
            
            # Translate text using chunked approach for long texts
            if len(transcribed_text) > 1000:
                logger.info(f"Using chunked translation for long text ({len(transcribed_text)} chars)")
                translated_text = await self.ai_service.translate_text_chunked(transcribed_text, language_code)
            else:
                translated_text = await self.ai_service.translate_text(transcribed_text, language_code)
            
            logger.info(f"Translated text: {translated_text[:100]}...")
            
            # Update task status
            await self.update_language_task_status(task_id, "processing", 75, "Generating speech...")
            
            # Generate speech using chunked approach for long texts
            if len(translated_text) > 1000:
                logger.info(f"Using chunked speech generation for long text ({len(translated_text)} chars)")
                speech_audio = await self.ai_service.generate_speech_chunked(translated_text, language_code)
            else:
                speech_audio = await self.ai_service.generate_speech(translated_text, language_code)
            logger.info(f"Generated audio: {len(speech_audio)} bytes")

            # Mix with background audio if present
            final_audio = speech_audio
            background_track_path = None

            if job.get('background_track_url'):
                background_track_path = await self.download_file_from_storage(job['background_track_url'], "background")

            if background_track_path:
                try:
                    await self.update_language_task_status(task_id, "processing", 85, "Mixing with background audio...")
                    logger.info(f"Found background track: {background_track_path}")

                    # Save speech audio to temp file
                    speech_temp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
                    speech_temp.write(speech_audio)
                    speech_temp.close()

                    # Create output file for mixed audio
                    mixed_temp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
                    mixed_temp.close()

                    # Mix the audio tracks
                    mixed_path = await self.ai_service.mix_audio_tracks(
                        voice_track_path=speech_temp.name,
                        background_track_path=str(background_track_path),
                        output_path=mixed_temp.name
                    )

                    # Read mixed audio
                    with open(mixed_path, 'rb') as f:
                        final_audio = f.read()

                    # Clean up temp files
                    os.remove(speech_temp.name)
                    os.remove(mixed_temp.name)

                    logger.info(f"Successfully mixed voice with background audio: {len(final_audio)} bytes")
                except Exception as e:
                    logger.error(f"Error mixing audio tracks: {e}")
                    logger.warning("Using voice-only audio due to mixing error")
                    final_audio = speech_audio
            else:
                logger.info("No background track found, using voice-only audio")

            # Update task status
            await self.update_language_task_status(task_id, "processing", 90, "Uploading audio to storage...")

            # Upload final audio to Supabase Storage
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"dubbed_audio_{job_id}_{language_code}_{timestamp}.mp3"
            output_path = f"outputs/{job['user_id']}/{job_id}/{output_filename}"

            try:
                # Upload to Supabase Storage
                public_url = await self.supabase_storage.upload_file(
                    bucket=self.bucket,
                    file_path=output_path,
                    file_data=final_audio,
                    content_type="audio/mpeg"
                )

                logger.info(f"Uploaded audio to Supabase Storage: {public_url}")

                # Generate signed download URL (valid for 7 days)
                download_url = await self.supabase_storage.generate_signed_download_url(
                    bucket=self.bucket,
                    file_path=output_path,
                    expires_in=604800  # 7 days
                )

                # Update task status to complete with download URL
                await self.update_language_task_status(
                    task_id,
                    "complete",
                    100,
                    f"Audio generated successfully",
                    download_url=download_url,
                    file_size=len(final_audio)
                )

            except Exception as e:
                logger.error(f"Error uploading audio to storage: {e}")
                raise Exception(f"Failed to upload audio to storage: {str(e)}")
            
            logger.info(f"Completed language task {task_id} for {language_code}")
            
        except Exception as e:
            logger.error(f"Error processing language task {task_id}: {e}")
            await self.update_language_task_status(task_id, "error", 0, f"Processing failed: {str(e)}")
    
    async def download_file_from_storage(self, file_path, file_type):
        """Download file from Supabase Storage or read from local filesystem in dev mode"""
        try:
            if not file_path:
                logger.warning(f"No {file_type} file path provided")
                return None

            # Check if we're in development mode (file path starts with "uploads/" or is a local path)
            is_local_file = file_path.startswith("uploads/") or os.path.exists(file_path)

            if is_local_file:
                # Development mode - read from local filesystem
                logger.info(f"Reading {file_type} file from local filesystem: {file_path}")

                # Check if file exists
                local_path = Path(file_path)
                if not local_path.exists():
                    raise Exception(f"Local file not found: {file_path}")

                # Read the local file
                with open(local_path, 'rb') as f:
                    file_data = f.read()

                # Determine file extension
                file_ext = os.path.splitext(file_path)[1] or ".mp3"

                # Save to temporary file for processing
                temp_file = tempfile.NamedTemporaryFile(suffix=file_ext, delete=False)
                temp_file.write(file_data)
                temp_file.close()

                logger.info(f"Read {file_type} file from local filesystem to: {temp_file.name}")
                return temp_file.name
            else:
                # Production mode - download from Supabase Storage
                logger.info(f"Downloading {file_type} file from Supabase Storage: {file_path}")

                # Download file from Supabase Storage
                file_data = await self.supabase_storage.download_file(self.bucket, file_path)

                # Determine file extension
                file_ext = os.path.splitext(file_path)[1] or ".mp3"

                # Save to temporary file
                temp_file = tempfile.NamedTemporaryFile(suffix=file_ext, delete=False)
                temp_file.write(file_data)
                temp_file.close()

                logger.info(f"Downloaded {file_type} file from storage to: {temp_file.name}")
                return temp_file.name

        except Exception as e:
            logger.error(f"Error downloading {file_type} file from storage: {e}")
            return None
    
    async def update_language_task_status(self, task_id, status, progress, message, download_url=None, file_size=None):
        """Update language task status in Supabase"""
        try:
            update_data = {
                'status': status,
                'progress': progress,
                'message': message
            }
            
            if download_url:
                update_data['audio_url'] = download_url
            
            if file_size:
                update_data['file_size'] = file_size
            
            self.db_service.update_language_task(task_id, update_data)
            logger.info(f"Updated task {task_id}: {status} ({progress}%) - {message}")
            
        except Exception as e:
            logger.error(f"Error updating task {task_id}: {e}")
    
    async def update_job_status(self, job_id, status, progress, message):
        """Update job status in Supabase"""
        try:
            update_data = {
                'status': status,
                'progress': progress,
                'message': message
            }
            
            self.db_service.update_job(job_id, update_data)
            logger.info(f"Updated job {job_id}: {status} ({progress}%) - {message}")
            
        except Exception as e:
            logger.error(f"Error updating job {job_id}: {e}")


# Global processor instance
processor = None

async def start_processor():
    """Start the job processor"""
    global processor
    if processor is None:
        processor = SupabaseJobProcessor()
    await processor.start()

async def stop_processor():
    """Stop the job processor"""
    global processor
    if processor:
        await processor.stop()
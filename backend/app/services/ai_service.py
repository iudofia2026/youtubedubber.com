"""
AI service for integrating with external AI providers
"""
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from app.config import settings
import openai
from deepgram import DeepgramClient, PrerecordedOptions, FileSource
import tempfile
import os

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI operations (STT, Translation, TTS)"""

    def __init__(self):
        # Initialize OpenAI client with new API
        from openai import AsyncOpenAI
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

        # Initialize Deepgram client
        self.deepgram = DeepgramClient(settings.deepgram_api_key)
    
    async def transcribe_audio(
        self,
        audio_file_path: str,
        language: str = "en"
    ) -> Dict[str, any]:
        """
        Transcribe audio using Deepgram
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                buffer_data = audio_file.read()
            
            payload: FileSource = {
                "buffer": buffer_data,
            }
            
            options = PrerecordedOptions(
                model="nova-2",
                language=language,
                smart_format=True,
                punctuate=True,
                utterances=True,
                diarize=True,
                paragraphs=True
            )
            
            response = self.deepgram.listen.prerecorded.v("1").transcribe_file(
                payload, options
            )
            
            # Extract transcript and timing information
            transcript = response.results.channels[0].alternatives[0].transcript
            words = response.results.channels[0].alternatives[0].words
            
            return {
                "transcript": transcript,
                "words": words,
                "confidence": response.results.channels[0].alternatives[0].confidence,
                "duration": response.metadata.duration
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise Exception("Failed to transcribe audio")
    
    async def translate_text(
        self,
        text: str,
        target_language: str,
        source_language: str = "en"
    ) -> str:
        """
        Translate text using OpenAI
        """
        try:
            # Map language codes to language names for better translation
            language_names = {
                "es": "Spanish",
                "fr": "French", 
                "de": "German",
                "ja": "Japanese",
                "zh": "Chinese",
                "ko": "Korean",
                "pt": "Portuguese",
                "it": "Italian",
                "ru": "Russian",
                "ar": "Arabic",
                "hi": "Hindi"
            }
            
            target_lang_name = language_names.get(target_language, target_language)
            source_lang_name = language_names.get(source_language, source_language)

            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Using latest efficient model
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a professional translator. Translate the following text from {source_lang_name} to {target_lang_name}. Maintain the original tone, style, and meaning. Return only the translated text."
                    },
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                max_tokens=2000,
                temperature=0.3
            )

            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error translating text: {e}")
            raise Exception("Failed to translate text")
    
    async def generate_speech(
        self,
        text: str,
        language: str,
        voice: str = None
    ) -> bytes:
        """
        Generate speech using Deepgram TTS
        """
        try:
            # Map language codes to Deepgram voices
            voice_mapping = {
                "en": "aura-asteria-en",
                "es": "aura-luna-es", 
                "fr": "aura-stella-fr",
                "de": "aura-arcas-de",
                "ja": "aura-asteria-en",  # Fallback to English voice
                "zh": "aura-asteria-en",  # Fallback to English voice
                "ko": "aura-asteria-en",  # Fallback to English voice
                "pt": "aura-asteria-en",  # Fallback to English voice
                "it": "aura-asteria-en",  # Fallback to English voice
                "ru": "aura-asteria-en",  # Fallback to English voice
                "ar": "aura-asteria-en",  # Fallback to English voice
                "hi": "aura-asteria-en"   # Fallback to English voice
            }
            
            selected_voice = voice or voice_mapping.get(language, "aura-asteria-en")
            
            response = self.deepgram.speak.v("1").save(
                {
                    "text": text,
                    "model": selected_voice
                }
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating speech: {e}")
            raise Exception("Failed to generate speech")
    
    async def process_audio_file(
        self,
        audio_file_path: str,
        target_languages: List[str],
        source_language: str = "en"
    ) -> Dict[str, Dict[str, any]]:
        """
        Process audio file for multiple languages
        """
        try:
            # Step 1: Transcribe audio
            logger.info(f"Transcribing audio file: {audio_file_path}")
            transcription_result = await self.transcribe_audio(audio_file_path, source_language)
            
            results = {}
            
            # Step 2: Process each target language
            for language in target_languages:
                logger.info(f"Processing language: {language}")
                
                try:
                    # Translate transcript
                    translated_text = await self.translate_text(
                        transcription_result["transcript"],
                        language,
                        source_language
                    )
                    
                    # Generate speech
                    speech_audio = await self.generate_speech(translated_text, language)
                    
                    results[language] = {
                        "original_transcript": transcription_result["transcript"],
                        "translated_transcript": translated_text,
                        "speech_audio": speech_audio,
                        "confidence": transcription_result["confidence"],
                        "duration": transcription_result["duration"]
                    }
                    
                except Exception as e:
                    logger.error(f"Error processing language {language}: {e}")
                    results[language] = {
                        "error": str(e),
                        "status": "failed"
                    }
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            raise Exception("Failed to process audio file")
    
    async def validate_audio_file(self, audio_file_path: str) -> Dict[str, any]:
        """
        Validate audio file format and properties
        """
        try:
            # Basic file validation
            if not os.path.exists(audio_file_path):
                raise Exception("Audio file not found")
            
            file_size = os.path.getsize(audio_file_path)
            max_size = settings.get_max_file_size_bytes()
            
            if file_size > max_size:
                raise Exception(f"File too large. Maximum size: {settings.max_file_size}")
            
            # Check file extension
            allowed_extensions = ['.mp3', '.wav', '.m4a', '.mp4']
            file_ext = os.path.splitext(audio_file_path)[1].lower()
            
            if file_ext not in allowed_extensions:
                raise Exception(f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}")
            
            # For MP4 files, we'll extract audio using FFmpeg in the processing pipeline
            if file_ext == '.mp4':
                # Additional validation for MP4 files
                # Check if file has audio track (basic validation)
                # This will be handled more thoroughly in the processing pipeline
                pass
            
            return {
                "valid": True,
                "file_size": file_size,
                "file_extension": file_ext
            }
            
        except Exception as e:
            logger.error(f"Error validating audio file: {e}")
            return {
                "valid": False,
                "error": str(e)
            }
    
    async def process_media_file(self, media_file_path: str) -> Dict[str, any]:
        """
        Process media file for dubbing (handles both audio and video files)
        """
        try:
            # Validate the media file first
            validation_result = await self.validate_audio_file(media_file_path)
            if not validation_result["valid"]:
                raise Exception(f"Media file validation failed: {validation_result['error']}")
            
            # Check if it's a video file that needs audio extraction
            file_ext = os.path.splitext(media_file_path)[1].lower()
            is_video = file_ext == '.mp4'
            
            # For now, return basic file information
            # In a real implementation, this would process the media
            return {
                "file_path": media_file_path,
                "file_size": validation_result["file_size"],
                "file_extension": validation_result["file_extension"],
                "is_video": is_video,
                "duration": 0,  # Placeholder
                "sample_rate": 44100,  # Placeholder
                "channels": 2  # Placeholder
            }
            
        except Exception as e:
            logger.error(f"Error processing media file: {e}")
            raise Exception("Failed to process media file")
    
    async def mix_audio_tracks(
        self,
        voice_track_path: str,
        background_track_path: str = None,
        output_path: str = None
    ) -> str:
        """
        Mix voice and background audio tracks
        """
        try:
            import ffmpeg
            
            if not background_track_path:
                # No background track, just copy voice track
                if output_path:
                    ffmpeg.input(voice_track_path).output(output_path).overwrite_output().run()
                    return output_path
                return voice_track_path
            
            # Mix voice and background tracks
            if not output_path:
                output_path = tempfile.mktemp(suffix=".mp3")
            
            # Create mixed audio
            voice = ffmpeg.input(voice_track_path)
            background = ffmpeg.input(background_track_path)
            
            # Mix audio tracks (voice at 100%, background at 100%)
            mixed = ffmpeg.filter([voice, background], 'amix', inputs=2, duration='shortest')
            output = ffmpeg.output(mixed, output_path, acodec='mp3', audio_bitrate='128k')
            
            ffmpeg.run(output, overwrite_output=True)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Error mixing audio tracks: {e}")
            raise Exception("Failed to mix audio tracks")
"""
AI service for integrating with external AI providers
"""
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from app.config import settings
import openai
from deepgram import DeepgramClient
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
        self.deepgram = DeepgramClient(api_key=settings.deepgram_api_key)
    
    async def transcribe_audio(
        self,
        audio_file_path: str,
        language: str = "en",
        diarize: bool = False
    ) -> Dict[str, any]:
        """
        Transcribe audio using Deepgram.
        If diarize is True, identifies different speakers.
        Returns a dictionary containing the full transcript, confidence, duration,
        and a list of utterance objects if diarization is enabled.
        """
        try:
            with open(audio_file_path, "rb") as audio_file:
                buffer_data = audio_file.read()

            request_params = {
                "model": "nova-2",
                "language": language,
                "smart_format": True,
                "punctuate": True,
                "paragraphs": True,
                "numerals": True
            }
            if diarize:
                request_params["diarize"] = True
                request_params["utterances"] = True

            response = self.deepgram.listen.v1.media.transcribe_file(
                request=buffer_data,
                **request_params
            )

            # Extract basic metadata
            results = response.results
            channel = results.channels[0]
            alternative = channel.alternatives[0]
            transcript = alternative.transcript
            confidence = alternative.confidence
            duration = response.model_dump().get("metadata", {}).get("duration")

            result = {
                "transcript": transcript,
                "confidence": confidence,
                "duration": duration,
                "utterances": []
            }

            if diarize:
                # If diarization is enabled, parse the utterances
                if results.utterances:
                    for utterance in results.utterances:
                        result["utterances"].append({
                            "start": utterance.start,
                            "end": utterance.end,
                            "text": utterance.transcript,
                            "speaker": utterance.speaker,
                            "confidence": utterance.confidence,
                        })
                    logger.info(f"Diarized audio with {len(result['utterances'])} utterances.")
                else:
                    logger.warning("Diarization was enabled, but no utterances were returned.")

            logger.info(f"Transcribed audio: {len(transcript)} chars, confidence: {confidence:.2f}")

            return result

        except Exception as e:
            logger.error(f"Error transcribing audio: {e}", exc_info=True)
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
    
    async def translate_text_chunked(
        self,
        text: str,
        target_language: str,
        source_language: str = "en",
        max_chunk_length: int = 1000
    ) -> str:
        """
        Translate long text by breaking it into chunks and translating each chunk
        
        Args:
            text: Text to translate
            target_language: Target language code
            source_language: Source language code
            max_chunk_length: Maximum characters per chunk (default: 1500 to stay under 2000 limit)
        
        Returns:
            Translated text
        """
        try:
            if len(text) <= max_chunk_length:
                # Text is short enough, translate directly
                return await self.translate_text(text, target_language, source_language)
            
            logger.info(f"Translating long text ({len(text)} chars) in chunks of {max_chunk_length}")
            
            # Split text into sentences for better chunking
            sentences = text.split('. ')
            chunks = []
            current_chunk = ""
            
            for sentence in sentences:
                # Add period back if it's not the last sentence
                if not sentence.endswith('.') and sentence != sentences[-1]:
                    sentence += '.'
                
                # Check if adding this sentence would exceed the limit
                if len(current_chunk) + len(sentence) + 1 <= max_chunk_length:
                    if current_chunk:
                        current_chunk += " " + sentence
                    else:
                        current_chunk = sentence
                else:
                    # Current chunk is full, save it and start a new one
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = sentence
            
            # Add the last chunk if it has content
            if current_chunk:
                chunks.append(current_chunk)
            
            logger.info(f"Split text into {len(chunks)} chunks")
            
            # Translate each chunk
            translated_chunks = []
            for i, chunk in enumerate(chunks):
                logger.info(f"Translating chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
                translated_chunk = await self.translate_text(chunk, target_language, source_language)
                translated_chunks.append(translated_chunk)
            
            # Combine translated chunks
            translated_text = " ".join(translated_chunks)
            logger.info(f"Translation complete: {len(translated_text)} characters")
            
            return translated_text
            
        except Exception as e:
            logger.error(f"Error translating chunked text: {e}")
            raise Exception("Failed to translate chunked text")
    
    async def _generate_speech_openai(
        self,
        text: str,
        language: str
    ) -> bytes:
        """
        Generate speech using OpenAI TTS (better quality for Chinese)
        """
        try:
            # Map language codes to OpenAI voice models
            # OpenAI TTS supports Chinese with excellent quality
            # Available voices: alloy, echo, fable, onyx, nova, shimmer
            # For Chinese, use a neutral voice that works well
            voice_name = "nova"  # Clear, neutral voice that works well for Chinese
            
            logger.info(f"Using OpenAI TTS for Chinese: {language}, voice: {voice_name}")
            
            # OpenAI TTS API
            response = await self.openai_client.audio.speech.create(
                model="tts-1",  # Use tts-1 for faster generation, or tts-1-hd for higher quality
                voice=voice_name,
                input=text,
                response_format="mp3"
            )
            
            # Get audio data - OpenAI returns content directly
            audio_data = response.content
            
            # Save to downloads directory
            import os
            from datetime import datetime
            
            downloads_path = "downloads"
            os.makedirs(downloads_path, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ytdubber_{language}_{timestamp}.mp3"
            file_path = os.path.join(downloads_path, filename)
            
            try:
                with open(file_path, 'wb') as f:
                    f.write(audio_data)
                logger.info(f"?? Generated Chinese audio saved to downloads: {filename}")
            except Exception as e:
                logger.warning(f"Could not save to downloads: {e}")
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error generating speech with OpenAI TTS: {e}", exc_info=True)
            raise Exception(f"Failed to generate speech with OpenAI: {str(e)}")
    
    async def generate_speech(
        self,
        text: str,
        language: str,
        voice: str = None
    ) -> bytes:
        """
        Generate speech using Deepgram TTS or OpenAI TTS (for better Chinese quality)
        """
        try:
            # Use OpenAI TTS for Chinese - much better quality than Deepgram
            if language in ["zh", "zh-CN", "zh-TW"]:
                return await self._generate_speech_openai(text, language)
            
            # Map language codes to Deepgram voices (using available Aura models)
            voice_mapping = {
                "en": "aura-asteria-en",      # English - Asteria (female, conversational)
                "es": "aura-2-sirio-es",      # Spanish - Sirio (male, professional) - confirmed working
                "fr": "aura-asteria-en",      # French - fallback to English (no French model available)
                "de": "aura-asteria-en",      # German - fallback to English (no German model available)
                "ja": "aura-asteria-en",      # Japanese - fallback to English (no Japanese model available)
                "ko": "aura-asteria-en",      # Korean - fallback to English (no Korean model available)
                "pt": "aura-asteria-en",      # Portuguese - fallback to English (no Portuguese model available)
                "it": "aura-asteria-en",      # Italian - fallback to English (no Italian model available)
                "ru": "aura-asteria-en",      # Russian - fallback to English (no Russian model available)
                "ar": "aura-asteria-en",      # Arabic - fallback to English (no Arabic model available)
                "hi": "aura-asteria-en"       # Hindi - fallback to English (no Hindi model available)
            }

            selected_voice = voice or voice_mapping.get(language, "aura-asteria-en")

            # Generate speech using Deepgram TTS
            response = self.deepgram.speak.v1.audio.generate(
                text=text,
                model=selected_voice,
                encoding="mp3"
            )

            # Collect all audio data from the iterator
            audio_data = b""
            for chunk in response:
                audio_data += chunk

            # Save to downloads directory for frontend access
            import os
            from datetime import datetime
            
            downloads_path = "downloads"
            os.makedirs(downloads_path, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ytdubber_{language}_{timestamp}.mp3"
            file_path = os.path.join(downloads_path, filename)
            
            try:
                with open(file_path, 'wb') as f:
                    f.write(audio_data)
                logger.info(f"?? Generated audio saved to downloads: {filename}")
            except Exception as e:
                logger.warning(f"Could not save to downloads: {e}")
                
            return audio_data

        except Exception as e:
            logger.error(f"Error generating speech: {e}", exc_info=True)
            raise Exception(f"Failed to generate speech: {str(e)}")
    
    async def generate_speech_chunked(
        self,
        text: str,
        language: str,
        voice: str = None,
        max_chunk_length: int = 1000
    ) -> bytes:
        """
        Generate speech for long text by breaking it into chunks and combining audio
        
        Args:
            text: Text to convert to speech
            language: Target language code
            voice: Voice to use (optional)
            max_chunk_length: Maximum characters per chunk (default: 1500)
        
        Returns:
            Combined audio data as bytes
        """
        try:
            if len(text) <= max_chunk_length:
                # Text is short enough, generate speech directly
                return await self.generate_speech(text, language, voice)
            
            logger.info(f"Generating speech for long text ({len(text)} chars) in chunks of {max_chunk_length}")
            
            # Split text into smaller chunks more aggressively
            chunks = []
            current_chunk = ""
            
            # Split by sentences first
            sentences = text.split('. ')
            
            for sentence in sentences:
                # Add period back if it's not the last sentence
                if not sentence.endswith('.') and sentence != sentences[-1]:
                    sentence += '.'
                
                # If a single sentence is too long, split it by words
                if len(sentence) > max_chunk_length:
                    words = sentence.split(' ')
                    for word in words:
                        if len(current_chunk) + len(word) + 1 <= max_chunk_length:
                            if current_chunk:
                                current_chunk += " " + word
                            else:
                                current_chunk = word
                        else:
                            # Current chunk is full, save it and start a new one
                            if current_chunk:
                                chunks.append(current_chunk)
                            current_chunk = word
                else:
                    # Check if adding this sentence would exceed the limit
                    if len(current_chunk) + len(sentence) + 1 <= max_chunk_length:
                        if current_chunk:
                            current_chunk += " " + sentence
                        else:
                            current_chunk = sentence
                    else:
                        # Current chunk is full, save it and start a new one
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sentence
            
            # Add the last chunk if it has content
            if current_chunk:
                chunks.append(current_chunk)
            
            logger.info(f"Split text into {len(chunks)} chunks for speech generation")
            
            # Generate speech for each chunk
            audio_chunks = []
            for i, chunk in enumerate(chunks):
                logger.info(f"Generating speech for chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
                chunk_audio = await self.generate_speech(chunk, language, voice)
                audio_chunks.append(chunk_audio)
            
            # Combine audio chunks using FFmpeg
            combined_audio = await self._combine_audio_chunks(audio_chunks)
            logger.info(f"Speech generation complete: {len(combined_audio)} bytes")
            
            return combined_audio
            
        except Exception as e:
            logger.error(f"Error generating chunked speech: {e}")
            raise Exception(f"Failed to generate chunked speech: {str(e)}")
    
    async def _combine_audio_chunks(self, audio_chunks: List[bytes]) -> bytes:
        """Combine multiple audio chunks into a single audio file"""
        try:
            import tempfile
            import subprocess
            from pathlib import Path
            
            # Create temporary directory for audio files
            temp_dir = Path(tempfile.mkdtemp())
            
            # Save each chunk to a temporary file
            chunk_files = []
            for i, chunk_audio in enumerate(audio_chunks):
                chunk_file = temp_dir / f"chunk_{i:03d}.mp3"
                with open(chunk_file, 'wb') as f:
                    f.write(chunk_audio)
                chunk_files.append(str(chunk_file))
            
            # Create file list for FFmpeg
            file_list = temp_dir / "file_list.txt"
            with open(file_list, 'w') as f:
                for chunk_file in chunk_files:
                    f.write(f"file '{chunk_file}'\n")
            
            # Use FFmpeg to concatenate audio files
            output_file = temp_dir / "combined.mp3"
            cmd = [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", str(file_list),
                "-acodec", "mp3",
                "-y",  # Overwrite output
                str(output_file)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=300)
            
            # Read the combined audio
            with open(output_file, 'rb') as f:
                combined_audio = f.read()
            
            # Clean up temporary files
            import shutil
            shutil.rmtree(temp_dir)
            
            return combined_audio
            
        except Exception as e:
            logger.error(f"Error combining audio chunks: {e}")
            raise Exception(f"Failed to combine audio chunks: {str(e)}")
    
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
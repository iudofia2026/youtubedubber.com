"""
Text-to-Speech service using ElevenLabs
"""

import os
import httpx
import tempfile
from typing import Dict, Any


class TTSService:
    """Text-to-Speech service using ElevenLabs API"""
    
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY environment variable is required")
        
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    async def synthesize(self, text: str, language: str = "en-US", voice_id: str = None) -> str:
        """
        Synthesize speech from text
        
        Args:
            text: Text to synthesize
            language: Target language code
            voice_id: Specific voice ID to use (optional)
            
        Returns:
            Path to the generated audio file
        """
        
        try:
            # Get voice ID based on language if not provided
            if not voice_id:
                voice_id = await self._get_voice_for_language(language)
            
            # Prepare request data
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/text-to-speech/{voice_id}",
                    headers=self.headers,
                    json=data,
                    timeout=60.0
                )
                
                response.raise_for_status()
                audio_data = response.content
            
            # Save audio to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            return temp_file_path
                
        except httpx.HTTPError as e:
            raise Exception(f"ElevenLabs API error: {e}")
        except Exception as e:
            raise Exception(f"TTS processing error: {e}")
    
    async def _get_voice_for_language(self, language: str) -> str:
        """
        Get appropriate voice ID for the given language
        
        Args:
            language: Language code
            
        Returns:
            Voice ID
        """
        
        # Default voice mapping for different languages
        voice_mapping = {
            "en-US": "pNInz6obpgDQGcFmaJgB",  # Adam
            "es-ES": "EXAVITQu4vr4xnSDxMaL",  # Bella
            "fr-FR": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "de-DE": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "it-IT": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "pt-PT": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "ja-JP": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "ko-KR": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "zh-CN": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "ru-RU": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "ar-SA": "EXAVITQu4vr4xnSDxMaL",  # Bella (multilingual)
            "hi-IN": "EXAVITQu4vr4xnSDxMaL"   # Bella (multilingual)
        }
        
        return voice_mapping.get(language, "EXAVITQu4vr4xnSDxMaL")  # Default to Bella
    
    async def get_available_voices(self) -> list:
        """
        Get list of available voices
        
        Returns:
            List of voice information
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/voices",
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                return result.get("voices", [])
                
        except httpx.HTTPError as e:
            raise Exception(f"ElevenLabs API error: {e}")
        except Exception as e:
            raise Exception(f"Error fetching voices: {e}")
    
    async def clone_voice(self, audio_file_path: str, name: str, description: str = None) -> str:
        """
        Clone a voice from audio sample
        
        Args:
            audio_file_path: Path to the audio file for voice cloning
            name: Name for the cloned voice
            description: Description of the voice
            
        Returns:
            Voice ID of the cloned voice
        """
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                audio_data = audio_file.read()
            
            files = {
                "files": ("audio.mp3", audio_data, "audio/mpeg")
            }
            
            data = {
                "name": name,
                "description": description or f"Cloned voice from {name}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/voices/add",
                    headers={"xi-api-key": self.api_key},
                    files=files,
                    data=data,
                    timeout=120.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                return result.get("voice_id")
                
        except httpx.HTTPError as e:
            raise Exception(f"ElevenLabs API error: {e}")
        except Exception as e:
            raise Exception(f"Voice cloning error: {e}")
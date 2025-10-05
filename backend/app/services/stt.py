"""
Speech-to-Text service using Deepgram
"""

import os
import httpx
from typing import Dict, Any
import json


class STTService:
    """Speech-to-Text service using Deepgram API"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPGRAM_API_KEY")
        if not self.api_key:
            raise ValueError("DEEPGRAM_API_KEY environment variable is required")
        
        self.base_url = "https://api.deepgram.com/v1"
        self.headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "audio/m4a"
        }
    
    async def transcribe(self, audio_file_path: str, language: str = "en-US") -> str:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code (e.g., 'en-US', 'es-ES')
            
        Returns:
            Transcribed text
        """
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                audio_data = audio_file.read()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/listen",
                    headers=self.headers,
                    params={
                        "model": "nova-2",
                        "language": language,
                        "punctuate": "true",
                        "diarize": "false",
                        "smart_format": "true"
                    },
                    content=audio_data,
                    timeout=60.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Extract transcript
                transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
                
                return transcript
                
        except httpx.HTTPError as e:
            raise Exception(f"Deepgram API error: {e}")
        except Exception as e:
            raise Exception(f"STT processing error: {e}")
    
    async def transcribe_with_timestamps(self, audio_file_path: str, language: str = "en-US") -> Dict[str, Any]:
        """
        Transcribe audio file with word-level timestamps
        
        Args:
            audio_file_path: Path to the audio file
            language: Language code
            
        Returns:
            Dictionary with transcript and word timestamps
        """
        
        try:
            with open(audio_file_path, "rb") as audio_file:
                audio_data = audio_file.read()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/listen",
                    headers=self.headers,
                    params={
                        "model": "nova-2",
                        "language": language,
                        "punctuate": "true",
                        "diarize": "false",
                        "smart_format": "true",
                        "words": "true"
                    },
                    content=audio_data,
                    timeout=60.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                # Extract transcript and words
                transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
                words = result["results"]["channels"][0]["alternatives"][0]["words"]
                
                return {
                    "transcript": transcript,
                    "words": words
                }
                
        except httpx.HTTPError as e:
            raise Exception(f"Deepgram API error: {e}")
        except Exception as e:
            raise Exception(f"STT processing error: {e}")
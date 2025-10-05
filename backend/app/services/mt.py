"""
Machine Translation service using OpenAI
"""

import os
import httpx
from typing import Dict, Any


class MTService:
    """Machine Translation service using OpenAI API"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate text from source language to target language
        
        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'en-US')
            target_lang: Target language code (e.g., 'es-ES')
            
        Returns:
            Translated text
        """
        
        try:
            # Map language codes to full names for better translation
            lang_map = {
                "en-US": "English",
                "es-ES": "Spanish",
                "fr-FR": "French",
                "de-DE": "German",
                "it-IT": "Italian",
                "pt-PT": "Portuguese",
                "ja-JP": "Japanese",
                "ko-KR": "Korean",
                "zh-CN": "Chinese (Simplified)",
                "ru-RU": "Russian",
                "ar-SA": "Arabic",
                "hi-IN": "Hindi"
            }
            
            source_lang_name = lang_map.get(source_lang, source_lang)
            target_lang_name = lang_map.get(target_lang, target_lang)
            
            prompt = f"""Translate the following text from {source_lang_name} to {target_lang_name}. 
            Maintain the same tone, style, and meaning. 
            If the text contains proper nouns or technical terms, keep them in their original form unless there's a commonly accepted translation.
            
            Text to translate: {text}
            
            Translation:"""
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "gpt-4",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a professional translator. Provide accurate, natural translations that maintain the original meaning and tone."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": 2000,
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                translated_text = result["choices"][0]["message"]["content"].strip()
                
                return translated_text
                
        except httpx.HTTPError as e:
            raise Exception(f"OpenAI API error: {e}")
        except Exception as e:
            raise Exception(f"Translation error: {e}")
    
    async def translate_with_context(self, text: str, source_lang: str, target_lang: str, context: str = None) -> str:
        """
        Translate text with additional context for better accuracy
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            context: Additional context about the content
            
        Returns:
            Translated text
        """
        
        try:
            lang_map = {
                "en-US": "English",
                "es-ES": "Spanish",
                "fr-FR": "French",
                "de-DE": "German",
                "it-IT": "Italian",
                "pt-PT": "Portuguese",
                "ja-JP": "Japanese",
                "ko-KR": "Korean",
                "zh-CN": "Chinese (Simplified)",
                "ru-RU": "Russian",
                "ar-SA": "Arabic",
                "hi-IN": "Hindi"
            }
            
            source_lang_name = lang_map.get(source_lang, source_lang)
            target_lang_name = lang_map.get(target_lang, target_lang)
            
            context_prompt = f"Context: {context}\n\n" if context else ""
            
            prompt = f"""{context_prompt}Translate the following text from {source_lang_name} to {target_lang_name}. 
            Maintain the same tone, style, and meaning. 
            If the text contains proper nouns or technical terms, keep them in their original form unless there's a commonly accepted translation.
            
            Text to translate: {text}
            
            Translation:"""
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "gpt-4",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a professional translator. Provide accurate, natural translations that maintain the original meaning and tone."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "max_tokens": 2000,
                        "temperature": 0.3
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()
                result = response.json()
                
                translated_text = result["choices"][0]["message"]["content"].strip()
                
                return translated_text
                
        except httpx.HTTPError as e:
            raise Exception(f"OpenAI API error: {e}")
        except Exception as e:
            raise Exception(f"Translation error: {e}")
#!/usr/bin/env python3
"""
Example: Using Google Gemini API with YT Dubber

To use this:
1. Get your Gemini API key from https://aistudio.google.com/app/apikey
2. Set environment variable: export GEMINI_API_KEY="your-api-key"
3. Run: python3 gemini_example.py
"""

import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

def setup_gemini():
    """Configure Gemini API"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable not set")
        print("Get your key from: https://aistudio.google.com/app/apikey")
        return None

    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-pro')

def enhance_translation(text, target_language):
    """Use Gemini to enhance translation for video dubbing"""
    model = setup_gemini()
    if not model:
        return text

    prompt = f"""
    Enhance this translation for video dubbing. Make it sound natural and conversational
    while preserving the original meaning. Target language: {target_language}

    Original text: {text}

    Requirements:
    - Keep similar length for lip-sync
    - Use natural, spoken language
    - Maintain emotional tone
    - Consider cultural context

    Enhanced translation:
    """

    try:
        response = model.generate_content(
            prompt,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )
        return response.text.strip()
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return text

def generate_voice_instructions(text, voice_style="natural"):
    """Generate voice synthesis instructions using Gemini"""
    model = setup_gemini()
    if not model:
        return {}

    prompt = f"""
    Analyze this text for voice synthesis and provide instructions:

    Text: {text}
    Voice style: {voice_style}

    Provide JSON with:
    - emotion: detected emotion (happy, sad, neutral, excited, etc.)
    - pace: speaking pace (slow, normal, fast)
    - emphasis: words that should be emphasized
    - pauses: suggested pause locations
    - tone: overall tone (formal, casual, energetic, calm)

    Example format:
    {{
        "emotion": "excited",
        "pace": "normal",
        "emphasis": ["amazing", "incredible"],
        "pauses": [5, 12],
        "tone": "energetic"
    }}
    """

    try:
        response = model.generate_content(prompt)
        # In a real implementation, you'd parse the JSON response
        return {
            "emotion": "neutral",
            "pace": "normal",
            "emphasis": [],
            "pauses": [],
            "tone": "natural"
        }
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return {}

if __name__ == "__main__":
    # Test the functions
    print("🚀 Testing Gemini API integration...")

    # Test translation enhancement
    sample_text = "Hello! Welcome to our amazing video tutorial."
    enhanced = enhance_translation(sample_text, "Spanish")
    print(f"✅ Enhanced translation: {enhanced}")

    # Test voice instructions
    instructions = generate_voice_instructions(sample_text)
    print(f"✅ Voice instructions: {instructions}")

    print("\n🎯 Integration complete! Add GEMINI_API_KEY to your environment variables.")
    print("📚 Documentation: https://ai.google.dev/tutorials/python_quickstart")
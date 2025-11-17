#!/usr/bin/env python3
"""
Test the complete STT → Translation → TTS pipeline
Demonstrates the production-ready dubbing workflow
"""
import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.ai_service import AIService
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_dubbing_pipeline():
    """Test the complete dubbing pipeline"""

    # Input files
    voice_file = "uploads/dev-user-123/job_7faa89915e2f/voice_track_VOICE-ONLY.mp4"
    background_file = "uploads/dev-user-123/job_7faa89915e2f/background_track_SFX-ONLY.mp4"
    target_language = "es"  # Spanish

    print("="*60)
    print("YOUTUBE MULTILINGUAL DUBBER - PIPELINE TEST")
    print("="*60)
    print(f"Voice File: {voice_file}")
    print(f"Background File: {background_file}")
    print(f"Target Language: Spanish ({target_language})")
    print("="*60)
    print()

    # Initialize AI service
    ai_service = AIService()

    try:
        # STEP 1: Extract audio from video (if needed)
        print("🎬 Step 1: Processing media file...")
        # For MP4 files, we'd extract audio, but AIService handles this
        audio_file = voice_file

        # STEP 2: Transcribe audio (STT with Deepgram)
        print("🎤 Step 2: Transcribing audio with Deepgram STT...")
        transcription_result = await ai_service.transcribe_audio(audio_file, language="en")
        transcript = transcription_result["transcript"]
        confidence = transcription_result.get("confidence", 0)
        duration = transcription_result.get("duration", 0)

        print(f"   ✓ Transcribed {len(transcript)} characters")
        print(f"   ✓ Confidence: {confidence:.2%}")
        print(f"   ✓ Duration: {duration:.1f}s")
        print(f"   📝 Transcript preview: {transcript[:150]}...")
        print()

        # STEP 3: Translate text (OpenAI)
        print("🌐 Step 3: Translating to Spanish with OpenAI...")
        translated_text = await ai_service.translate_text_chunked(
            text=transcript,
            target_language=target_language,
            source_language="en"
        )

        print(f"   ✓ Translated {len(translated_text)} characters")
        print(f"   📝 Translation preview: {translated_text[:150]}...")
        print()

        # STEP 4: Generate speech (TTS with Deepgram)
        print("🔊 Step 4: Generating Spanish speech with Deepgram TTS...")
        speech_audio = await ai_service.generate_speech_chunked(
            text=translated_text,
            language=target_language
        )

        print(f"   ✓ Generated {len(speech_audio)} bytes of audio")
        print()

        # STEP 5: Mix with background audio
        print("🎵 Step 5: Mixing voice with background audio...")

        # Save speech to temp file
        import tempfile
        speech_temp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        speech_temp.write(speech_audio)
        speech_temp.close()

        # Create output file
        output_temp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        output_temp.close()

        # Mix audio tracks
        mixed_path = await ai_service.mix_audio_tracks(
            voice_track_path=speech_temp.name,
            background_track_path=background_file,
            output_path=output_temp.name
        )

        # Read mixed audio
        with open(mixed_path, 'rb') as f:
            final_audio = f.read()

        print(f"   ✓ Mixed audio: {len(final_audio)} bytes")
        print()

        # STEP 6: Save final output
        print("💾 Step 6: Saving final dubbed audio...")
        downloads_dir = Path("downloads")
        downloads_dir.mkdir(exist_ok=True)

        output_file = downloads_dir / f"dubbed_{target_language}_final.mp3"
        with open(output_file, 'wb') as f:
            f.write(final_audio)

        print(f"   ✓ Saved to: {output_file}")
        print(f"   ✓ File size: {len(final_audio) / 1024 / 1024:.2f} MB")
        print()

        # Clean up temp files
        os.remove(speech_temp.name)
        os.remove(output_temp.name)

        # SUCCESS!
        print("="*60)
        print("✅ PIPELINE TEST COMPLETED SUCCESSFULLY!")
        print("="*60)
        print()
        print("Summary:")
        print(f"  • Original audio transcribed: {len(transcript)} chars")
        print(f"  • Translated to Spanish: {len(translated_text)} chars")
        print(f"  • Generated speech: {len(speech_audio) / 1024:.1f} KB")
        print(f"  • Final mixed audio: {len(final_audio) / 1024:.1f} KB")
        print(f"  • Output file: {output_file}")
        print()
        print("🎉 Your dubbed audio is ready for download!")
        print("="*60)

        return str(output_file)

    except Exception as e:
        print()
        print("="*60)
        print("❌ PIPELINE TEST FAILED")
        print("="*60)
        print(f"Error: {str(e)}")
        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    print()
    result = asyncio.run(test_dubbing_pipeline())
    print(f"\n🎧 Listen to your dubbed audio: {result}")

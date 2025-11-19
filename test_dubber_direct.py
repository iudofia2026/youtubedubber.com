#!/Users/iudofia/Desktop/youtubedubber.com/backend_hidden/venv/bin/python
"""
Direct dubbing test that preserves original timing by aligning on utterance timestamps.
"""
import sys
import os

# Ensure backend modules resolve correctly
os.chdir("/Users/iudofia/Desktop/youtubedubber.com/backend_hidden")
sys.path.insert(0, "/Users/iudofia/Desktop/youtubedubber.com/backend_hidden")

import asyncio
import tempfile
import shutil
import subprocess

from app.services.ai_service import AIService
from app.utils.media import MediaProcessor

# Configuration
VOICE_FILE = "/Users/iudofia/Desktop/VOICE ONLY.mp4"
SFX_FILE = "/Users/iudofia/Desktop/SFX ONLY.mp4"
OUTPUT_DIR = "/Users/iudofia/Desktop/youtubedubber_output"
TARGET_LANGUAGE = "es"  # Spanish

HEADER = "=" * 70

# Speaker voice mapping
SPEAKER_VOICES = {
    0: "aura-asteria-en",  # Female
    1: "aura-helios-en",   # Male
}
DEFAULT_VOICE = "aura-luna-en"

def _run_ffmpeg(cmd: list):
    """Run FFmpeg command with basic error handling."""
    subprocess.run(cmd, capture_output=True, text=True, check=True)


async def process_dubbing():
    """Run the full dubbing pipeline with utterance-based timing."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(HEADER)
    print("YT DUBBER - DIARIZATION & UTTERANCE TIMING TEST")
    print(HEADER)
    print()
    print(f"✓ Output directory: {OUTPUT_DIR}")
    print()

    print("Initializing services...")
    ai_service = AIService()
    media_processor = MediaProcessor()
    print("✓ Services ready")
    print()

    temp_dir = tempfile.mkdtemp(prefix="ytdubber_")
    segments_dir = os.path.join(temp_dir, "segments")
    os.makedirs(segments_dir, exist_ok=True)

    def create_silence_clip(duration: float, output_path: str):
        """Create a silent audio clip of the specified duration."""
        safe_duration = max(duration, 0.05)
        cmd = [
            "ffmpeg",
            "-f", "lavfi",
            "-i", "anullsrc=r=44100:cl=stereo",
            "-t", f"{safe_duration:.3f}",
            "-acodec", "libmp3lame",
            "-q:a", "2",
            "-y",
            output_path,
        ]
        _run_ffmpeg(cmd)

    def match_duration(input_file: str, output_file: str, target_duration: float):
        """Pad or slightly time-stretch audio so it matches the target duration."""
        if target_duration <= 0.05:
            create_silence_clip(target_duration, output_file)
            return

        actual = media_processor.get_duration(input_file)
        if actual <= 0:
            create_silence_clip(target_duration, output_file)
            return

        # Enforce format (stereo, 44.1kHz) and match duration
        if abs(actual - target_duration) <= 0.05:
            cmd = [
                "ffmpeg", "-i", input_file,
                "-ar", "44100", "-ac", "2",
                "-acodec", "libmp3lame", "-q:a", "2", "-y",
                output_file
            ]
            _run_ffmpeg(cmd)
            return

        if actual < target_duration:
            cmd = [
                "ffmpeg", "-i", input_file,
                "-af", f"apad=pad_dur={target_duration}",
                "-t", f"{target_duration:.3f}",
                "-ar", "44100", "-ac", "2",
                "-acodec", "libmp3lame", "-q:a", "2", "-y",
                output_file,
            ]
            _run_ffmpeg(cmd)
        else:
            speed_factor = actual / target_duration
            if speed_factor <= 1.35:
                atempo_filter = f"atempo={speed_factor:.3f}"
                cmd = [
                    "ffmpeg", "-i", input_file,
                    "-filter:a", atempo_filter,
                    "-t", f"{target_duration:.3f}",
                    "-ar", "44100", "-ac", "2",
                    "-acodec", "libmp3lame", "-q:a", "2", "-y",
                    output_file,
                ]
                _run_ffmpeg(cmd)
            else:
                cmd = [
                    "ffmpeg", "-i", input_file,
                    "-t", f"{target_duration:.3f}",
                    "-ar", "44100", "-ac", "2",
                    "-acodec", "libmp3lame", "-q:a", "2", "-y",
                    output_file,
                ]
                _run_ffmpeg(cmd)

    try:
        print("Step 1: Extracting audio from voice track...")
        voice_audio = os.path.join(temp_dir, "voice.wav")
        media_processor.extract_audio_from_video(VOICE_FILE, voice_audio)
        total_duration = media_processor.get_duration(voice_audio)
        print(f"✓ Voice audio extracted ({total_duration:.2f}s)")
        print()

        print("Step 2: Transcribing track with diarization...")
        transcription = await ai_service.transcribe_audio(
            voice_audio,
            language="en",
            diarize=True,
        )
        utterances = transcription.get("utterances", [])
        if not utterances:
            utterances = [{"start": 0.0, "end": total_duration, "text": transcription.get("transcript", ""), "speaker": 0}]
        print(f"✓ Retrieved {len(utterances)} utterances")
        for utt in utterances[:5]:
            print(f"  • SPK {utt.get('speaker',-1)} ({utt.get('start',0):.2f}s - {utt.get('end',0):.2f}s): {utt.get('text','')[:50]}...")
        if len(utterances) > 5:
            print(f"  ... and {len(utterances) - 5} more utterances")
        print()

        print("Step 3: Building timeline segments...")
        segments = []
        last_end = 0.0
        for utt in utterances:
            start = max(0.0, float(utt.get("start", 0.0)))
            end = max(start, float(utt.get("end", start)))
            if start - last_end >= 0.1:
                segments.append({"start": last_end, "end": start, "duration": start - last_end, "is_silence": True})
            segments.append({
                "start": start, "end": end, "duration": max(end - start, 0.05),
                "is_silence": False, "text": utt.get("text", "").strip(), "speaker": utt.get("speaker", 0)
            })
            last_end = end
        if total_duration - last_end >= 0.1:
            segments.append({"start": last_end, "end": total_duration, "duration": total_duration - last_end, "is_silence": True})
        print(f"✓ Timeline ready: {len(segments)} segments")
        print()

        print("Step 4: Processing segments...")
        processed_segments = []
        transcript_parts, translation_parts = [], []
        for idx, segment in enumerate(segments):
            seg_duration = segment["duration"]
            output_path = os.path.join(segments_dir, f"segment_{idx:03d}.mp3")

            if segment["is_silence"]:
                create_silence_clip(seg_duration, output_path)
                processed_segments.append(output_path)
                continue

            text = segment.get("text", "")
            if not text:
                create_silence_clip(seg_duration, output_path)
                processed_segments.append(output_path)
                continue

            try:
                speaker = segment.get("speaker", 0)
                voice = SPEAKER_VOICES.get(speaker, DEFAULT_VOICE)
                print(f"  Segment {idx+1}/{len(segments)} [SPK {speaker}]: {segment['start']:.2f}s, {seg_duration:.2f}s, voice: {voice}")

                translated = await ai_service.translate_text(text, TARGET_LANGUAGE)
                tts_audio = await ai_service.generate_speech(translated, TARGET_LANGUAGE, voice=voice)
                raw_tts_path = os.path.join(segments_dir, f"segment_{idx:03d}_raw.mp3")
                with open(raw_tts_path, "wb") as f:
                    f.write(tts_audio)

                match_duration(raw_tts_path, output_path, seg_duration)
                processed_segments.append(output_path)
                transcript_parts.append(text)
                translation_parts.append(translated)
                print(f"    ✓ Processed ({len(text)} chars)")
            except Exception as seg_err:
                print(f"    ⚠ Error processing segment: {seg_err}, inserting silence.")
                create_silence_clip(seg_duration, output_path)
                processed_segments.append(output_path)

        print("✓ All segments processed")
        print()

        print("Step 5: Reconstructing voice track...")
        reconstructed_audio = os.path.join(temp_dir, f"reconstructed_{TARGET_LANGUAGE}.mp3")
        concat_list = os.path.join(temp_dir, "segments.txt")
        with open(concat_list, "w") as f:
            for seg_file in processed_segments:
                f.write(f"file '{os.path.abspath(seg_file)}'\n")
        cmd_concat = ["ffmpeg", "-f", "concat", "-safe", "0", "-i", concat_list, "-acodec", "libmp3lame", "-q:a", "2", "-y", reconstructed_audio]
        _run_ffmpeg(cmd_concat)
        print("✓ Voice track reconstructed")
        print()

        print("Step 6: Mixing with SFX track...")
        final_output = os.path.join(OUTPUT_DIR, f"dubbed_{TARGET_LANGUAGE}_final.mp3")
        try:
            await ai_service.mix_audio_tracks(voice_track_path=reconstructed_audio, background_track_path=SFX_FILE, output_path=final_output)
            print("✓ Audio mixed successfully")
        except Exception as mix_err:
            print(f"⚠ Warning: Mixing failed ({mix_err}), using voice track only")
            shutil.copy2(reconstructed_audio, final_output)
        print()

        print(HEADER)
        print("✓ DUBBING COMPLETE")
        print(HEADER)
        # ... final print statements ...

    except Exception as exc:
        print(f"\n✗ Error: {exc}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        print(f"Temp files kept for inspection: {temp_dir}")

    return True


if __name__ == "__main__":
    print("Starting dubbing process...")
    # ...
    success = asyncio.run(process_dubbing())
    if success:
        print("✓ Test completed successfully!")
        print(f"\n🎧 Check your output: {OUTPUT_DIR}")
    else:
        print("✗ Test failed!")
        sys.exit(1)

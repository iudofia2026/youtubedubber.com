#!/Users/iudofia/Desktop/youtubedubber.com/backend_hidden/venv/bin/python
"""
Direct dubbing test that performs intelligent voice matching based on pitch.
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
import librosa
import numpy as np

from app.services.ai_service import AIService
from app.utils.media import MediaProcessor

# Configuration
VOICE_FILE = "/Users/iudofia/Desktop/VOICE ONLY.mp4"
SFX_FILE = "/Users/iudofia/Desktop/SFX ONLY.mp4"
OUTPUT_DIR = "/Users/iudofia/Desktop/youtubedubber_output"
TARGET_LANGUAGE = "es"

HEADER = "=" * 70

# Profiles for available Spanish voices with estimated pitches
# (Higher value = higher pitch)
SPANISH_VOICE_PROFILES = [
    {"name": "aura-2-celeste-es", "pitch": 210, "gender": "Female"},  # Higher pitch, female
    {"name": "aura-2-nestor-es", "pitch": 125, "gender": "Male"},    # Lower pitch, male
]
DEFAULT_VOICE = "aura-2-celeste-es"

def _run_ffmpeg(cmd: list):
    """Run FFmpeg command with basic error handling."""
    subprocess.run(cmd, capture_output=True, text=True, check=True)

def analyze_pitch(audio_path: str) -> float:
    """Analyzes the average pitch of an audio file."""
    try:
        y, sr = librosa.load(audio_path, sr=None)
        f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        valid_f0 = f0[~np.isnan(f0)]
        return np.mean(valid_f0) if len(valid_f0) > 0 else 0.0
    except Exception as e:
        print(f"    ⚠ Could not analyze pitch for {audio_path}: {e}")
        return 0.0

def assign_voices_to_speakers(speaker_pitches: dict, voice_profiles: list) -> dict:
    """Assigns the best voice to each speaker based on pitch."""
    assignments = {}
    
    # Sort speakers by pitch and voices by pitch
    sorted_speakers = sorted(speaker_pitches.items(), key=lambda item: item[1])
    sorted_voices = sorted(voice_profiles, key=lambda item: item['pitch'])
    
    # Simple assignment: match sorted lists
    # This assumes a similar number of speakers and voices
    for i, (speaker_id, pitch) in enumerate(sorted_speakers):
        # Assign the closest voice profile, cycling if more speakers than voices
        voice_profile = sorted_voices[i % len(sorted_voices)]
        assignments[speaker_id] = voice_profile['name']
        print(f"  • Speaker {speaker_id} (pitch ~{pitch:.0f} Hz) assigned to {voice_profile['name']} ({voice_profile['gender']}, pitch ~{voice_profile['pitch']} Hz)")

    return assignments

async def process_dubbing():
    """Run the full dubbing pipeline with intelligent voice matching."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(HEADER)
    print("YT DUBBER - INTELLIGENT VOICE MATCHING TEST")
    print(HEADER)
    
    # ... (services, temp dirs, helper functions setup)
    temp_dir = tempfile.mkdtemp(prefix="ytdubber_")
    segments_dir = os.path.join(temp_dir, "segments")
    os.makedirs(segments_dir, exist_ok=True)
    ai_service = AIService()
    media_processor = MediaProcessor()

    try:
        print("\nStep 1: Extracting audio from voice track...")
        voice_audio = os.path.join(temp_dir, "voice.wav")
        media_processor.extract_audio_from_video(VOICE_FILE, voice_audio)
        total_duration = media_processor.get_duration(voice_audio)
        print(f"✓ Voice audio extracted ({total_duration:.2f}s)")

        print("\nStep 2: Transcribing track with diarization...")
        transcription = await ai_service.transcribe_audio(voice_audio, language="en", diarize=True)
        utterances = transcription.get("utterances", [])
        if not utterances:
            raise Exception("No utterances found in audio.")
        print(f"✓ Retrieved {len(utterances)} utterances")

        print("\nStep 2a: Analyzing speaker pitches...")
        speaker_samples = {}
        unique_speakers = sorted(list(set(utt.get("speaker") for utt in utterances)))
        for speaker_id in unique_speakers:
            speaker_utterances = [u for u in utterances if u.get("speaker") == speaker_id and (u.get('end', 0) - u.get('start', 0)) > 0.5]
            if not speaker_utterances: continue
            longest_utt = max(speaker_utterances, key=lambda u: u.get('end', 0) - u.get('start', 0))
            
            sample_path = os.path.join(temp_dir, f"speaker_{speaker_id}_sample.wav")
            _run_ffmpeg(["ffmpeg", "-i", voice_audio, "-ss", str(longest_utt['start']), "-t", str(longest_utt['end'] - longest_utt['start']), "-y", sample_path])
            speaker_samples[speaker_id] = sample_path
        
        speaker_pitches = {sid: analyze_pitch(p) for sid, p in speaker_samples.items()}
        print("✓ Pitch analysis complete.")

        print("\nStep 2b: Assigning voices based on pitch...")
        speaker_voice_map = assign_voices_to_speakers(speaker_pitches, SPANISH_VOICE_PROFILES)
        print("✓ Voice assignment complete.")

        print("\nStep 3: Building timeline segments...")
        # ... (This logic remains the same as it's about timing, not voices)
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


        print("\nStep 4: Processing segments with matched voices...")
        processed_segments = []
        for idx, segment in enumerate(segments):
            output_path = os.path.join(segments_dir, f"segment_{idx:03d}.mp3")
            if segment["is_silence"] or not segment.get("text"):
                create_silence_clip(segment["duration"], output_path)
                processed_segments.append(output_path)
                continue

            try:
                speaker = segment.get("speaker", 0)
                voice = speaker_voice_map.get(speaker, DEFAULT_VOICE)
                
                translated = await ai_service.translate_text(segment["text"], TARGET_LANGUAGE)
                tts_audio = await ai_service.generate_speech(translated, TARGET_LANGUAGE, voice=voice)
                
                raw_tts_path = os.path.join(segments_dir, f"segment_{idx:03d}_raw.mp3")
                with open(raw_tts_path, "wb") as f: f.write(tts_audio)
                
                match_duration(raw_tts_path, output_path, segment["duration"])
                processed_segments.append(output_path)
            except Exception as seg_err:
                print(f"    ⚠ Error processing segment {idx+1}: {seg_err}, inserting silence.")
                create_silence_clip(segment["duration"], output_path)
                processed_segments.append(output_path)
        print("✓ All segments processed.")

        # ... (Steps 5 and 6 for reconstruction and mixing remain the same)
        print("\nStep 5: Reconstructing voice track...")
        reconstructed_audio = os.path.join(temp_dir, f"reconstructed_{TARGET_LANGUAGE}.mp3")
        concat_list = os.path.join(temp_dir, "segments.txt")
        with open(concat_list, "w") as f:
            for seg_file in processed_segments:
                f.write(f"file '{os.path.abspath(seg_file)}'\n")
        _run_ffmpeg(["ffmpeg", "-f", "concat", "-safe", "0", "-i", concat_list, "-acodec", "libmp3lame", "-q:a", "2", "-y", reconstructed_audio])
        print("✓ Voice track reconstructed.")

        print("\nStep 6: Mixing with SFX track...")
        final_output = os.path.join(OUTPUT_DIR, f"dubbed_{TARGET_LANGUAGE}_final.mp3")
        await ai_service.mix_audio_tracks(voice_track_path=reconstructed_audio, background_track_path=SFX_FILE, output_path=final_output)
        print("✓ Audio mixed successfully.")
        
        print("\n" + HEADER)
        print("✓ DUBBING COMPLETE")
        print(HEADER)

    except Exception as exc:
        print(f"\n✗ Error: {exc}")
        traceback.print_exc()
        return False
    finally:
        print(f"Temp files kept for inspection: {temp_dir}")
    
    return True

# ... (main execution block remains the same)
if __name__ == "__main__":
    asyncio.run(process_dubbing())


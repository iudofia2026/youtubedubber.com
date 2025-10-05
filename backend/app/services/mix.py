"""
Audio mixing service for combining voice and background audio
"""

import os
import numpy as np
import soundfile as sf
import ffmpeg
from typing import Tuple, Dict, Any
import tempfile


class MixingService:
    """Service for mixing voice and background audio"""
    
    def __init__(self):
        self.sample_rate = 44100
        self.voice_volume = 0.8  # Voice volume (0.0 to 1.0)
        self.background_volume = 0.3  # Background volume (0.0 to 1.0)
    
    async def mix_audio(self, voice_path: str, background_path: str) -> str:
        """
        Mix voice audio with background audio
        
        Args:
            voice_path: Path to voice audio file
            background_path: Path to background audio file
            
        Returns:
            Path to mixed audio file
        """
        
        try:
            # Load audio files
            voice_audio, voice_sr = sf.read(voice_path)
            background_audio, bg_sr = sf.read(background_path)
            
            # Resample to common sample rate
            if voice_sr != self.sample_rate:
                voice_audio = self._resample_audio(voice_audio, voice_sr, self.sample_rate)
            
            if bg_sr != self.sample_rate:
                background_audio = self._resample_audio(background_audio, bg_sr, self.sample_rate)
            
            # Ensure both audio files are the same length
            voice_audio, background_audio = self._match_lengths(voice_audio, background_audio)
            
            # Apply volume levels
            voice_audio = voice_audio * self.voice_volume
            background_audio = background_audio * self.background_volume
            
            # Mix the audio
            mixed_audio = voice_audio + background_audio
            
            # Normalize to prevent clipping
            mixed_audio = self._normalize_audio(mixed_audio)
            
            # Save mixed audio
            output_path = tempfile.mktemp(suffix=".wav")
            sf.write(output_path, mixed_audio, self.sample_rate)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Audio mixing error: {e}")
    
    def _resample_audio(self, audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """Resample audio to target sample rate"""
        
        try:
            # Use ffmpeg for high-quality resampling
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_input:
                sf.write(temp_input.name, audio, orig_sr)
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_output:
                    (
                        ffmpeg
                        .input(temp_input.name)
                        .output(temp_output.name, acodec='pcm_s16le', ar=target_sr)
                        .overwrite_output()
                        .run(quiet=True)
                    )
                    
                    resampled_audio, _ = sf.read(temp_output.name)
                    
                    # Clean up temp files
                    os.unlink(temp_input.name)
                    os.unlink(temp_output.name)
                    
                    return resampled_audio
                    
        except Exception as e:
            # Fallback to simple linear interpolation
            ratio = target_sr / orig_sr
            new_length = int(len(audio) * ratio)
            indices = np.linspace(0, len(audio) - 1, new_length)
            return np.interp(indices, np.arange(len(audio)), audio)
    
    def _match_lengths(self, voice_audio: np.ndarray, background_audio: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Match the lengths of two audio arrays"""
        
        voice_length = len(voice_audio)
        background_length = len(background_audio)
        
        if voice_length == background_length:
            return voice_audio, background_audio
        
        # Use the longer length
        target_length = max(voice_length, background_length)
        
        # Pad or trim voice audio
        if voice_length < target_length:
            # Pad with silence
            padding = np.zeros(target_length - voice_length)
            voice_audio = np.concatenate([voice_audio, padding])
        elif voice_length > target_length:
            # Trim to target length
            voice_audio = voice_audio[:target_length]
        
        # Pad or trim background audio
        if background_length < target_length:
            # Loop background audio to match length
            loops_needed = (target_length // background_length) + 1
            background_audio = np.tile(background_audio, loops_needed)[:target_length]
        elif background_length > target_length:
            # Trim to target length
            background_audio = background_audio[:target_length]
        
        return voice_audio, background_audio
    
    def _normalize_audio(self, audio: np.ndarray) -> np.ndarray:
        """Normalize audio to prevent clipping"""
        
        # Check if audio is clipped
        max_val = np.max(np.abs(audio))
        
        if max_val > 1.0:
            # Normalize to prevent clipping
            audio = audio / max_val * 0.95  # Leave some headroom
        
        return audio
    
    async def mix_with_ducking(
        self, 
        voice_path: str, 
        background_path: str, 
        ducking_threshold: float = 0.1
    ) -> str:
        """
        Mix audio with ducking (background volume reduces when voice is present)
        
        Args:
            voice_path: Path to voice audio file
            background_path: Path to background audio file
            ducking_threshold: Threshold for ducking activation
            
        Returns:
            Path to mixed audio file
        """
        
        try:
            # Load audio files
            voice_audio, voice_sr = sf.read(voice_path)
            background_audio, bg_sr = sf.read(background_path)
            
            # Resample to common sample rate
            if voice_sr != self.sample_rate:
                voice_audio = self._resample_audio(voice_audio, voice_sr, self.sample_rate)
            
            if bg_sr != self.sample_rate:
                background_audio = self._resample_audio(background_audio, bg_sr, self.sample_rate)
            
            # Ensure both audio files are the same length
            voice_audio, background_audio = self._match_lengths(voice_audio, background_audio)
            
            # Apply ducking
            ducked_background = self._apply_ducking(voice_audio, background_audio, ducking_threshold)
            
            # Apply volume levels
            voice_audio = voice_audio * self.voice_volume
            ducked_background = ducked_background * self.background_volume
            
            # Mix the audio
            mixed_audio = voice_audio + ducked_background
            
            # Normalize to prevent clipping
            mixed_audio = self._normalize_audio(mixed_audio)
            
            # Save mixed audio
            output_path = tempfile.mktemp(suffix=".wav")
            sf.write(output_path, mixed_audio, self.sample_rate)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Audio mixing with ducking error: {e}")
    
    def _apply_ducking(self, voice_audio: np.ndarray, background_audio: np.ndarray, threshold: float) -> np.ndarray:
        """Apply ducking to background audio based on voice presence"""
        
        # Calculate voice envelope (RMS over short windows)
        window_size = int(self.sample_rate * 0.1)  # 100ms windows
        voice_envelope = []
        
        for i in range(0, len(voice_audio), window_size):
            window = voice_audio[i:i + window_size]
            rms = np.sqrt(np.mean(window ** 2))
            voice_envelope.append(rms)
        
        # Interpolate envelope to match audio length
        envelope_indices = np.linspace(0, len(voice_audio) - 1, len(voice_envelope))
        full_envelope = np.interp(np.arange(len(voice_audio)), envelope_indices, voice_envelope)
        
        # Calculate ducking factor
        ducking_factor = np.where(full_envelope > threshold, 0.3, 1.0)  # Reduce to 30% when voice is present
        
        # Apply ducking to background audio
        ducked_background = background_audio * ducking_factor
        
        return ducked_background
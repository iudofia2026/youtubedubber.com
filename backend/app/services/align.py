"""
Audio alignment service for synchronizing translated speech with original timing
"""

import os
import numpy as np
import soundfile as sf
import ffmpeg
from typing import Tuple, List, Dict, Any
import tempfile


class AlignmentService:
    """Service for aligning translated audio with original timing"""
    
    def __init__(self):
        self.sample_rate = 44100
        self.frame_length = 1024
        self.hop_length = 256
    
    async def align_audio(
        self, 
        original_audio_path: str, 
        translated_audio_path: str, 
        original_text: str, 
        translated_text: str
    ) -> str:
        """
        Align translated audio with original audio timing
        
        Args:
            original_audio_path: Path to original audio file
            translated_audio_path: Path to translated audio file
            original_text: Original transcript
            translated_text: Translated text
            
        Returns:
            Path to aligned audio file
        """
        
        try:
            # Load audio files
            original_audio, orig_sr = sf.read(original_audio_path)
            translated_audio, trans_sr = sf.read(translated_audio_path)
            
            # Resample to common sample rate
            if orig_sr != self.sample_rate:
                original_audio = self._resample_audio(original_audio, orig_sr, self.sample_rate)
            
            if trans_sr != self.sample_rate:
                translated_audio = self._resample_audio(translated_audio, trans_sr, self.sample_rate)
            
            # Calculate duration ratio
            original_duration = len(original_audio) / self.sample_rate
            translated_duration = len(translated_audio) / self.sample_rate
            
            # Simple time-stretching to match duration
            if abs(original_duration - translated_duration) > 0.1:  # 100ms threshold
                stretch_ratio = original_duration / translated_duration
                translated_audio = self._time_stretch(translated_audio, stretch_ratio)
            
            # Save aligned audio
            output_path = tempfile.mktemp(suffix=".wav")
            sf.write(output_path, translated_audio, self.sample_rate)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Audio alignment error: {e}")
    
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
    
    def _time_stretch(self, audio: np.ndarray, stretch_ratio: float) -> np.ndarray:
        """Time stretch audio by the given ratio"""
        
        try:
            # Use ffmpeg for time stretching
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_input:
                sf.write(temp_input.name, audio, self.sample_rate)
                
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_output:
                    (
                        ffmpeg
                        .input(temp_input.name)
                        .filter('atempo', stretch_ratio)
                        .output(temp_output.name, acodec='pcm_s16le')
                        .overwrite_output()
                        .run(quiet=True)
                    )
                    
                    stretched_audio, _ = sf.read(temp_output.name)
                    
                    # Clean up temp files
                    os.unlink(temp_input.name)
                    os.unlink(temp_output.name)
                    
                    return stretched_audio
                    
        except Exception as e:
            # Fallback to simple resampling
            new_length = int(len(audio) / stretch_ratio)
            indices = np.linspace(0, len(audio) - 1, new_length)
            return np.interp(indices, np.arange(len(audio)), audio)
    
    async def align_with_word_timestamps(
        self, 
        original_audio_path: str, 
        translated_audio_path: str, 
        original_words: List[Dict[str, Any]], 
        translated_words: List[Dict[str, Any]]
    ) -> str:
        """
        Advanced alignment using word-level timestamps
        
        Args:
            original_audio_path: Path to original audio file
            translated_audio_path: Path to translated audio file
            original_words: Word timestamps from original audio
            translated_words: Word timestamps from translated audio
            
        Returns:
            Path to aligned audio file
        """
        
        try:
            # Load audio files
            original_audio, orig_sr = sf.read(original_audio_path)
            translated_audio, trans_sr = sf.read(translated_audio_path)
            
            # Resample to common sample rate
            if orig_sr != self.sample_rate:
                original_audio = self._resample_audio(original_audio, orig_sr, self.sample_rate)
            
            if trans_sr != self.sample_rate:
                translated_audio = self._resample_audio(translated_audio, trans_sr, self.sample_rate)
            
            # Calculate timing adjustments
            original_duration = len(original_audio) / self.sample_rate
            translated_duration = len(translated_audio) / self.sample_rate
            
            # Apply word-level timing adjustments
            aligned_audio = self._apply_word_timing(
                translated_audio, 
                original_words, 
                translated_words, 
                original_duration
            )
            
            # Save aligned audio
            output_path = tempfile.mktemp(suffix=".wav")
            sf.write(output_path, aligned_audio, self.sample_rate)
            
            return output_path
            
        except Exception as e:
            raise Exception(f"Advanced audio alignment error: {e}")
    
    def _apply_word_timing(
        self, 
        audio: np.ndarray, 
        original_words: List[Dict[str, Any]], 
        translated_words: List[Dict[str, Any]], 
        target_duration: float
    ) -> np.ndarray:
        """Apply word-level timing adjustments"""
        
        # This is a simplified implementation
        # In a production system, you'd want more sophisticated timing adjustment
        
        current_duration = len(audio) / self.sample_rate
        stretch_ratio = target_duration / current_duration
        
        return self._time_stretch(audio, stretch_ratio)
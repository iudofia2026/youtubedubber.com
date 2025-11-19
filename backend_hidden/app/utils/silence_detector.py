"""
Silence detection and timestamp-based audio chunking
Preserves original timing by detecting silence periods and splitting accordingly
"""
import subprocess
import logging
import tempfile
from pathlib import Path
from typing import List, Dict, Tuple
import re

logger = logging.getLogger(__name__)


class SilenceDetector:
    """Detects silence periods in audio and splits into timestamped chunks"""
    
    def __init__(self, silence_threshold: float = 2.0, silence_level: str = "-30dB"):
        """
        Initialize silence detector
        
        Args:
            silence_threshold: Minimum duration of silence to split on (seconds)
            silence_level: Audio level threshold for silence detection
        """
        self.silence_threshold = silence_threshold
        self.silence_level = silence_level
    
    def detect_silence_periods(self, audio_file: str) -> List[Tuple[float, float]]:
        """
        Detect silence periods in audio file using FFmpeg silencedetect filter
        
        Returns:
            List of (start_time, end_time) tuples for silence periods
        """
        try:
            logger.info(f"Detecting silence in {audio_file}")
            
            # Use FFmpeg silencedetect filter
            cmd = [
                'ffmpeg',
                '-i', audio_file,
                '-af', f'silencedetect=noise={self.silence_level}:d={self.silence_threshold}',
                '-f', 'null',
                '-'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True
            )
            
            # Parse silence detection output
            # Format: silence_start: 5.234 | silence_end: 7.456 | silence_duration: 2.222
            silence_periods = []
            silence_start = None
            
            # silencedetect writes to stderr by default
            ffmpeg_output = result.stderr or result.stdout or ""
            
            for line in ffmpeg_output.split('\n'):
                # Look for silence_start
                start_match = re.search(r'silence_start: ([\d.]+)', line)
                if start_match:
                    silence_start = float(start_match.group(1))
                
                # Look for silence_end
                end_match = re.search(r'silence_end: ([\d.]+)', line)
                if end_match and silence_start is not None:
                    silence_end = float(end_match.group(1))
                    silence_periods.append((silence_start, silence_end))
                    silence_start = None
            
            logger.info(f"Found {len(silence_periods)} silence periods >= {self.silence_threshold}s")
            return silence_periods
            
        except Exception as e:
            logger.error(f"Error detecting silence: {e}")
            return []
    
    def split_at_silence(self, audio_file: str, output_dir: str) -> List[Dict]:
        """
        Split audio file at silence periods, preserving timestamps and silence
        
        Args:
            audio_file: Path to input audio file
            output_dir: Directory to save chunks
            
        Returns:
            List of chunk info dicts with start_time, end_time, file_path, and is_silence flag
        """
        try:
            # Get total duration first
            duration = self._get_duration(audio_file)
            
            # Detect silence periods
            silence_periods = self.detect_silence_periods(audio_file)
            
            # Build segments: speech chunks and silence chunks
            chunks = []
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            current_time = 0.0
            chunk_index = 0
            
            for silence_start, silence_end in silence_periods:
                # Extract speech chunk before silence
                if silence_start > current_time + 0.5:  # Only if there's meaningful speech
                    speech_chunk_file = output_path / f"chunk_{chunk_index:03d}_speech_{current_time:.2f}s_{silence_start:.2f}s.wav"
                    self._extract_chunk(audio_file, str(speech_chunk_file), current_time, silence_start)
                    
                    chunks.append({
                        "index": chunk_index,
                        "start_time": current_time,
                        "end_time": silence_start,
                        "duration": silence_start - current_time,
                        "file_path": str(speech_chunk_file),
                        "is_silence": False
                    })
                    chunk_index += 1
                
                # Extract silence chunk
                silence_duration = silence_end - silence_start
                if silence_duration >= self.silence_threshold:
                    silence_chunk_file = output_path / f"chunk_{chunk_index:03d}_silence_{silence_start:.2f}s_{silence_end:.2f}s.wav"
                    self._extract_chunk(audio_file, str(silence_chunk_file), silence_start, silence_end)
                    
                    chunks.append({
                        "index": chunk_index,
                        "start_time": silence_start,
                        "end_time": silence_end,
                        "duration": silence_duration,
                        "file_path": str(silence_chunk_file),
                        "is_silence": True
                    })
                    chunk_index += 1
                
                current_time = silence_end
            
            # Extract final speech chunk after last silence
            if current_time < duration - 0.5:
                speech_chunk_file = output_path / f"chunk_{chunk_index:03d}_speech_{current_time:.2f}s_{duration:.2f}s.wav"
                self._extract_chunk(audio_file, str(speech_chunk_file), current_time, duration)
                
                chunks.append({
                    "index": chunk_index,
                    "start_time": current_time,
                    "end_time": duration,
                    "duration": duration - current_time,
                    "file_path": str(speech_chunk_file),
                    "is_silence": False
                })
            
            # If no silence periods found, create single chunk
            if not chunks:
                chunk_file = output_path / f"chunk_000_speech_0.00s_{duration:.2f}s.wav"
                self._extract_chunk(audio_file, str(chunk_file), 0.0, duration)
                chunks.append({
                    "index": 0,
                    "start_time": 0.0,
                    "end_time": duration,
                    "duration": duration,
                    "file_path": str(chunk_file),
                    "is_silence": False
                })
            
            logger.info(f"Created {len(chunks)} chunks ({sum(1 for c in chunks if not c['is_silence'])} speech, {sum(1 for c in chunks if c['is_silence'])} silence)")
            return chunks
            
        except Exception as e:
            logger.error(f"Error splitting audio: {e}")
            raise
    
    def reconstruct_with_timing(
        self,
        chunks: List[Dict],
        original_audio: str,
        output_file: str
    ) -> str:
        """
        Reconstruct audio from processed chunks, preserving original timing
        
        Args:
            chunks: List of chunk dicts with processed audio files
            original_audio: Original audio file (for timing reference)
            output_file: Path for final output
            
        Returns:
            Path to reconstructed file
        """
        try:
            logger.info(f"Reconstructing audio with {len(chunks)} chunks")
            
            # Create a filter complex that places each chunk at its original timestamp
            # We'll use FFmpeg's filter_complex to overlay chunks at correct times
            
            # First, create a silent audio track matching original duration
            duration = self._get_duration(original_audio)
            
            # Build filter complex for overlaying chunks
            filter_parts = []
            inputs = []
            
            # Create silent base track
            base_file = Path(output_file).parent / "base_silent.wav"
            self._create_silent_audio(str(base_file), duration)
            inputs.append(str(base_file))
            
            # Add each chunk as an overlay at its timestamp
            for i, chunk in enumerate(chunks):
                chunk_path = chunk.get('processed_file_path', chunk['file_path'])
                if not Path(chunk_path).exists():
                    logger.warning(f"Chunk file not found: {chunk_path}, skipping")
                    continue
                
                inputs.append(chunk_path)
                start_time = chunk['start_time']
                
                # Overlay this chunk at its original timestamp
                # Format: [0:v][1:a]amix=inputs=2:duration=first:dropout_transition=2[out]
                if i == 0:
                    filter_parts.append(f"[0:a][{i+1}:a]amix=inputs=2:duration=longest:dropout_transition=0")
                else:
                    filter_parts.append(f"[out][{i+1}:a]amix=inputs=2:duration=longest:dropout_transition=0")
            
            # Build FFmpeg command
            cmd = ['ffmpeg']
            
            # Add input files
            for inp in inputs:
                cmd.extend(['-i', inp])
            
            # Add filter complex
            if filter_parts:
                filter_complex = ';'.join(filter_parts) + '[out]'
                cmd.extend(['-filter_complex', filter_complex])
                cmd.extend(['-map', '[out]'])
            else:
                cmd.extend(['-map', '0:a'])
            
            cmd.extend([
                '-acodec', 'libmp3lame',
                '-q:a', '2',
                '-y',
                output_file
            ])
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=300)
            
            # Cleanup
            if base_file.exists():
                base_file.unlink()
            
            logger.info(f"Reconstructed audio saved to: {output_file}")
            return output_file
            
        except Exception as e:
            logger.error(f"Error reconstructing audio: {e}")
            raise
    
    def _get_duration(self, audio_file: str) -> float:
        """Get audio duration using FFprobe"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-show_entries', 'format=duration',
                '-of', 'csv=p=0',
                audio_file
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except Exception as e:
            logger.error(f"Error getting duration: {e}")
            raise
    
    def _extract_chunk(self, input_file: str, output_file: str, start: float, end: float):
        """Extract audio chunk using FFmpeg"""
        try:
            cmd = [
                'ffmpeg',
                '-i', input_file,
                '-ss', str(start),
                '-t', str(end - start),
                '-acodec', 'pcm_s16le',
                '-ar', '44100',
                '-ac', '2',
                '-y',
                output_file
            ]
            subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=60)
        except Exception as e:
            logger.error(f"Error extracting chunk: {e}")
            raise
    
    def _create_silent_audio(self, output_file: str, duration: float):
        """Create silent audio track of specified duration"""
        try:
            cmd = [
                'ffmpeg',
                '-f', 'lavfi',
                '-i', f'anullsrc=channel_layout=stereo:sample_rate=44100',
                '-t', str(duration),
                '-acodec', 'pcm_s16le',
                '-y',
                output_file
            ]
            subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=30)
        except Exception as e:
            logger.error(f"Error creating silent audio: {e}")
            raise

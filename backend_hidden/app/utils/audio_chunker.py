#!/usr/bin/env python3
"""
Audio chunking utilities for processing long audio files
"""
import os
import tempfile
import subprocess
import logging
from pathlib import Path
from typing import List, Tuple, Dict
import json

logger = logging.getLogger(__name__)

class AudioChunker:
    """Handles chunking of audio files for processing"""
    
    def __init__(self, chunk_duration: int = 45):
        """
        Initialize chunker with specified duration in seconds
        
        Args:
            chunk_duration: Duration of each chunk in seconds (default: 45)
        """
        self.chunk_duration = chunk_duration
        self.temp_dir = Path(tempfile.gettempdir()) / "audio_chunks"
        self.temp_dir.mkdir(exist_ok=True)
    
    def chunk_audio(self, audio_file_path: str, job_id: str) -> List[Dict[str, str]]:
        """
        Split audio file into chunks
        
        Args:
            audio_file_path: Path to the input audio file
            job_id: Job ID for naming chunks
            
        Returns:
            List of chunk information dictionaries
        """
        try:
            logger.info(f"Chunking audio file: {audio_file_path}")
            
            # Get audio duration first
            duration = self._get_audio_duration(audio_file_path)
            logger.info(f"Audio duration: {duration:.2f} seconds")
            
            chunks = []
            chunk_index = 0
            start_time = 0
            
            while start_time < duration:
                end_time = min(start_time + self.chunk_duration, duration)
                
                # Create chunk file path
                chunk_filename = f"{job_id}_chunk_{chunk_index:03d}.wav"
                chunk_path = self.temp_dir / chunk_filename
                
                # Extract chunk using FFmpeg
                self._extract_chunk(audio_file_path, chunk_path, start_time, end_time)
                
                # Store chunk info
                chunk_info = {
                    "index": chunk_index,
                    "start_time": start_time,
                    "end_time": end_time,
                    "duration": end_time - start_time,
                    "file_path": str(chunk_path),
                    "filename": chunk_filename
                }
                chunks.append(chunk_info)
                
                logger.info(f"Created chunk {chunk_index}: {start_time:.2f}s - {end_time:.2f}s")
                
                chunk_index += 1
                start_time = end_time
            
            logger.info(f"Created {len(chunks)} chunks for job {job_id}")
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking audio: {e}")
            raise Exception(f"Failed to chunk audio: {str(e)}")
    
    def _get_audio_duration(self, audio_file_path: str) -> float:
        """Get duration of audio file using FFprobe"""
        try:
            cmd = [
                "ffprobe",
                "-v", "quiet",
                "-show_entries", "format=duration",
                "-of", "csv=p=0",
                audio_file_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            duration = float(result.stdout.strip())
            return duration
            
        except Exception as e:
            logger.error(f"Error getting audio duration: {e}")
            raise Exception(f"Failed to get audio duration: {str(e)}")
    
    def _extract_chunk(self, input_path: str, output_path: str, start_time: float, end_time: float):
        """Extract audio chunk using FFmpeg"""
        try:
            cmd = [
                "ffmpeg",
                "-i", input_path,
                "-ss", str(start_time),
                "-t", str(end_time - start_time),
                "-acodec", "pcm_s16le",
                "-ar", "44100",
                "-ac", "2",
                "-y",  # Overwrite output
                str(output_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=60)
            logger.debug(f"Extracted chunk: {start_time:.2f}s - {end_time:.2f}s")
            
        except subprocess.TimeoutExpired:
            logger.error(f"FFmpeg timeout extracting chunk {start_time:.2f}s - {end_time:.2f}s")
            raise Exception("Chunk extraction timeout")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error extracting chunk: {e.stderr}")
            raise Exception(f"Failed to extract chunk: {e.stderr}")
    
    def reconstruct_audio(self, chunk_files: List[str], output_path: str) -> str:
        """
        Reconstruct audio from chunks while preserving timing
        
        Args:
            chunk_files: List of chunk file paths in order
            output_path: Path for the reconstructed audio file
            
        Returns:
            Path to the reconstructed audio file
        """
        try:
            logger.info(f"Reconstructing audio from {len(chunk_files)} chunks")
            
            if not chunk_files:
                raise Exception("No chunk files provided for reconstruction")
            
            # Create a temporary file list for FFmpeg
            file_list_path = self.temp_dir / "file_list.txt"
            
            with open(file_list_path, 'w') as f:
                for chunk_file in chunk_files:
                    f.write(f"file '{chunk_file}'\n")
            
            # Use FFmpeg to concatenate chunks
            cmd = [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", str(file_list_path),
                "-acodec", "pcm_s16le",
                "-ar", "44100",
                "-ac", "2",
                "-y",  # Overwrite output
                str(output_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=300)
            
            # Clean up file list
            file_list_path.unlink()
            
            logger.info(f"Successfully reconstructed audio: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error reconstructing audio: {e}")
            raise Exception(f"Failed to reconstruct audio: {str(e)}")
    
    def cleanup_chunks(self, job_id: str):
        """Clean up temporary chunk files for a job"""
        try:
            chunk_files = list(self.temp_dir.glob(f"{job_id}_chunk_*.wav"))
            for chunk_file in chunk_files:
                chunk_file.unlink()
            logger.info(f"Cleaned up {len(chunk_files)} chunk files for job {job_id}")
        except Exception as e:
            logger.warning(f"Error cleaning up chunks for job {job_id}: {e}")
    
    def get_chunk_info(self, job_id: str) -> List[Dict]:
        """Get information about existing chunks for a job"""
        chunk_files = list(self.temp_dir.glob(f"{job_id}_chunk_*.wav"))
        chunks = []
        
        for chunk_file in sorted(chunk_files):
            try:
                # Extract chunk index from filename
                filename = chunk_file.name
                chunk_index = int(filename.split('_chunk_')[1].split('.')[0])
                
                # Get file size
                file_size = chunk_file.stat().st_size
                
                chunks.append({
                    "index": chunk_index,
                    "file_path": str(chunk_file),
                    "filename": filename,
                    "size": file_size
                })
            except Exception as e:
                logger.warning(f"Error processing chunk info for {chunk_file}: {e}")
        
        return chunks
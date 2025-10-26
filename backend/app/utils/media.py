"""
Media file utilities for extracting metadata and processing audio/video files
"""
import json
import subprocess
import logging
from typing import Dict, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class MediaProcessor:
    """Utility class for processing media files with FFprobe and FFmpeg"""

    @staticmethod
    def extract_metadata(file_path: str) -> Dict:
        """
        Extract metadata from audio/video file using FFprobe

        Args:
            file_path: Path to media file

        Returns:
            dict: {
                'duration': float,         # Duration in seconds
                'format': str,             # File format (e.g., 'mp3', 'wav')
                'codec': str,              # Audio codec
                'sample_rate': int,        # Sample rate in Hz
                'channels': int,           # Number of audio channels
                'bit_rate': int,           # Bit rate in bps
                'file_size': int,          # File size in bytes
                'has_video': bool,         # True if file contains video stream
                'has_audio': bool          # True if file contains audio stream
            }

        Raises:
            FileNotFoundError: If file doesn't exist
            Exception: If FFprobe fails
        """
        if not Path(file_path).exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            # Run FFprobe to get JSON metadata
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                file_path
            ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=30  # 30 second timeout
            )

            metadata = json.loads(result.stdout)

            # Extract format information
            format_info = metadata.get('format', {})
            streams = metadata.get('streams', [])

            # Find audio and video streams
            audio_stream = None
            video_stream = None

            for stream in streams:
                if stream.get('codec_type') == 'audio' and not audio_stream:
                    audio_stream = stream
                elif stream.get('codec_type') == 'video' and not video_stream:
                    video_stream = stream

            # Build response
            response = {
                'duration': float(format_info.get('duration', 0)),
                'format': format_info.get('format_name', 'unknown').split(',')[0],
                'file_size': int(format_info.get('size', 0)),
                'bit_rate': int(format_info.get('bit_rate', 0)),
                'has_video': video_stream is not None,
                'has_audio': audio_stream is not None,
            }

            # Add audio-specific metadata if audio stream exists
            if audio_stream:
                response.update({
                    'codec': audio_stream.get('codec_name', 'unknown'),
                    'sample_rate': int(audio_stream.get('sample_rate', 0)),
                    'channels': int(audio_stream.get('channels', 0)),
                })
            else:
                # Defaults if no audio stream
                response.update({
                    'codec': 'none',
                    'sample_rate': 0,
                    'channels': 0,
                })

            logger.info(
                f"Extracted metadata from {file_path}: "
                f"{response['duration']:.2f}s, {response['format']}, "
                f"{response['codec']}, {response['sample_rate']}Hz"
            )

            return response

        except subprocess.TimeoutExpired:
            logger.error(f"FFprobe timeout for file {file_path}")
            raise Exception("Metadata extraction timeout")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFprobe failed for {file_path}: {e.stderr}")
            raise Exception(f"Failed to extract metadata: {e.stderr}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse FFprobe JSON output: {e}")
            raise Exception("Invalid FFprobe output")
        except Exception as e:
            logger.error(f"Error extracting metadata from {file_path}: {e}")
            raise

    @staticmethod
    def extract_audio_from_video(video_path: str, output_path: str) -> str:
        """
        Extract audio track from video file using FFmpeg

        Args:
            video_path: Path to input video file
            output_path: Path for output audio file (e.g., .mp3 or .wav)

        Returns:
            str: Path to extracted audio file

        Raises:
            FileNotFoundError: If video file doesn't exist
            Exception: If extraction fails
        """
        if not Path(video_path).exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        try:
            logger.info(f"Extracting audio from {video_path} to {output_path}")

            # Determine output format from extension
            output_ext = Path(output_path).suffix.lower()

            if output_ext == '.mp3':
                # Extract as MP3 with reasonable quality
                cmd = [
                    'ffmpeg',
                    '-i', video_path,
                    '-vn',  # No video
                    '-acodec', 'libmp3lame',
                    '-q:a', '2',  # High quality (0-9, lower is better)
                    '-y',  # Overwrite output file
                    output_path
                ]
            elif output_ext == '.wav':
                # Extract as WAV (lossless)
                cmd = [
                    'ffmpeg',
                    '-i', video_path,
                    '-vn',  # No video
                    '-acodec', 'pcm_s16le',  # 16-bit PCM
                    '-ar', '44100',  # 44.1kHz sample rate
                    '-y',  # Overwrite output file
                    output_path
                ]
            else:
                # Default: copy audio stream as-is
                cmd = [
                    'ffmpeg',
                    '-i', video_path,
                    '-vn',  # No video
                    '-acodec', 'copy',
                    '-y',  # Overwrite output file
                    output_path
                ]

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=300  # 5 minute timeout for large videos
            )

            if not Path(output_path).exists():
                raise Exception("Audio extraction completed but output file not found")

            logger.info(f"Audio extracted successfully to {output_path}")
            return output_path

        except subprocess.TimeoutExpired:
            logger.error(f"FFmpeg timeout extracting audio from {video_path}")
            raise Exception("Audio extraction timeout")
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg failed: {e.stderr}")
            raise Exception(f"Failed to extract audio: {e.stderr}")
        except Exception as e:
            logger.error(f"Error extracting audio from {video_path}: {e}")
            raise

    @staticmethod
    def validate_audio_file(file_path: str) -> bool:
        """
        Validate that file is a valid audio/video file with audio stream

        Args:
            file_path: Path to file to validate

        Returns:
            bool: True if file has valid audio stream

        Raises:
            FileNotFoundError: If file doesn't exist
        """
        try:
            metadata = MediaProcessor.extract_metadata(file_path)
            return metadata.get('has_audio', False)
        except Exception as e:
            logger.error(f"File validation failed for {file_path}: {e}")
            return False

    @staticmethod
    def get_duration(file_path: str) -> float:
        """
        Get duration of media file in seconds

        Args:
            file_path: Path to media file

        Returns:
            float: Duration in seconds

        Raises:
            FileNotFoundError: If file doesn't exist
            Exception: If duration extraction fails
        """
        metadata = MediaProcessor.extract_metadata(file_path)
        return metadata.get('duration', 0.0)

    @staticmethod
    def calculate_checksum(file_path: str) -> str:
        """
        Calculate SHA256 checksum of file

        Args:
            file_path: Path to file

        Returns:
            str: Hexadecimal SHA256 checksum

        Raises:
            FileNotFoundError: If file doesn't exist
        """
        import hashlib

        if not Path(file_path).exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        sha256_hash = hashlib.sha256()

        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                sha256_hash.update(chunk)

        checksum = sha256_hash.hexdigest()
        logger.debug(f"Calculated checksum for {file_path}: {checksum}")

        return checksum

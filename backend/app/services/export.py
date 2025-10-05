"""
Export service for generating final output files
"""

import os
import ffmpeg
from typing import Dict, Any
import tempfile


class ExportService:
    """Service for exporting final audio and subtitle files"""
    
    def __init__(self):
        self.output_dir = "outputs"
        self.sample_rate = 44100
        self.bitrate = "192k"
    
    async def export_job(
        self, 
        job_id: str, 
        language: str, 
        voice_audio_path: str, 
        full_mix_path: str, 
        transcript: str
    ) -> Dict[str, str]:
        """
        Export all files for a job in a specific language
        
        Args:
            job_id: Job identifier
            language: Language code
            voice_audio_path: Path to voice-only audio
            full_mix_path: Path to full mix audio
            transcript: Translated transcript
            
        Returns:
            Dictionary with paths to exported files
        """
        
        try:
            # Create language-specific output directory
            lang_dir = os.path.join(self.output_dir, job_id, language)
            os.makedirs(lang_dir, exist_ok=True)
            
            # Export voice-only audio
            voice_output = os.path.join(lang_dir, f"{job_id}-{language}-voice_only.m4a")
            await self._export_audio(voice_audio_path, voice_output)
            
            # Export full mix audio
            full_mix_output = os.path.join(lang_dir, f"{job_id}-{language}-full_mix.m4a")
            await self._export_audio(full_mix_path, full_mix_output)
            
            # Export subtitles
            subtitles_output = os.path.join(lang_dir, f"{job_id}-{language}-captions.srt")
            await self._export_subtitles(transcript, subtitles_output, language)
            
            return {
                "voice_only": voice_output,
                "full_mix": full_mix_output,
                "captions": subtitles_output
            }
            
        except Exception as e:
            raise Exception(f"Export error: {e}")
    
    async def _export_audio(self, input_path: str, output_path: str) -> None:
        """Export audio file with proper encoding"""
        
        try:
            (
                ffmpeg
                .input(input_path)
                .output(
                    output_path,
                    acodec='aac',
                    ar=self.sample_rate,
                    ab=self.bitrate,
                    ac=2  # Stereo
                )
                .overwrite_output()
                .run(quiet=True)
            )
            
        except ffmpeg.Error as e:
            raise Exception(f"Audio export error: {e}")
    
    async def _export_subtitles(self, transcript: str, output_path: str, language: str) -> None:
        """Export subtitles in SRT format"""
        
        try:
            # For now, create a simple SRT file with the full transcript
            # In a production system, you'd want word-level timing
            
            srt_content = f"1\n00:00:00,000 --> 00:00:10,000\n{transcript}\n"
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(srt_content)
                
        except Exception as e:
            raise Exception(f"Subtitle export error: {e}")
    
    async def export_with_timing(
        self, 
        job_id: str, 
        language: str, 
        voice_audio_path: str, 
        full_mix_path: str, 
        transcript: str, 
        word_timings: list
    ) -> Dict[str, str]:
        """
        Export files with precise word-level timing
        
        Args:
            job_id: Job identifier
            language: Language code
            voice_audio_path: Path to voice-only audio
            full_mix_path: Path to full mix audio
            transcript: Translated transcript
            word_timings: List of word timing data
            
        Returns:
            Dictionary with paths to exported files
        """
        
        try:
            # Create language-specific output directory
            lang_dir = os.path.join(self.output_dir, job_id, language)
            os.makedirs(lang_dir, exist_ok=True)
            
            # Export voice-only audio
            voice_output = os.path.join(lang_dir, f"{job_id}-{language}-voice_only.m4a")
            await self._export_audio(voice_audio_path, voice_output)
            
            # Export full mix audio
            full_mix_output = os.path.join(lang_dir, f"{job_id}-{language}-full_mix.m4a")
            await self._export_audio(full_mix_path, full_mix_output)
            
            # Export subtitles with timing
            subtitles_output = os.path.join(lang_dir, f"{job_id}-{language}-captions.srt")
            await self._export_timed_subtitles(transcript, word_timings, subtitles_output, language)
            
            return {
                "voice_only": voice_output,
                "full_mix": full_mix_output,
                "captions": subtitles_output
            }
            
        except Exception as e:
            raise Exception(f"Export with timing error: {e}")
    
    async def _export_timed_subtitles(
        self, 
        transcript: str, 
        word_timings: list, 
        output_path: str, 
        language: str
    ) -> None:
        """Export subtitles with word-level timing"""
        
        try:
            srt_content = ""
            subtitle_index = 1
            
            # Group words into subtitle segments (e.g., 3-5 words per subtitle)
            words_per_subtitle = 4
            current_words = []
            current_start = None
            current_end = None
            
            for word_data in word_timings:
                word = word_data.get('word', '')
                start_time = word_data.get('start', 0)
                end_time = word_data.get('end', 0)
                
                if current_start is None:
                    current_start = start_time
                
                current_words.append(word)
                current_end = end_time
                
                # Create subtitle when we have enough words or reach the end
                if len(current_words) >= words_per_subtitle or word_data == word_timings[-1]:
                    # Format time for SRT
                    start_srt = self._format_srt_time(current_start)
                    end_srt = self._format_srt_time(current_end)
                    
                    # Create subtitle text
                    subtitle_text = ' '.join(current_words)
                    
                    # Add to SRT content
                    srt_content += f"{subtitle_index}\n{start_srt} --> {end_srt}\n{subtitle_text}\n\n"
                    
                    # Reset for next subtitle
                    subtitle_index += 1
                    current_words = []
                    current_start = None
                    current_end = None
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(srt_content)
                
        except Exception as e:
            raise Exception(f"Timed subtitle export error: {e}")
    
    def _format_srt_time(self, seconds: float) -> str:
        """Format time in seconds to SRT format (HH:MM:SS,mmm)"""
        
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millisecs = int((seconds % 1) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"
    
    async def create_zip_archive(self, job_id: str, language: str) -> str:
        """Create a ZIP archive with all files for a language"""
        
        try:
            import zipfile
            
            lang_dir = os.path.join(self.output_dir, job_id, language)
            zip_path = os.path.join(self.output_dir, job_id, f"{job_id}-{language}-bundle.zip")
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(lang_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, lang_dir)
                        zipf.write(file_path, arcname)
            
            return zip_path
            
        except Exception as e:
            raise Exception(f"ZIP archive creation error: {e}")
// Utility functions for audio file handling

export interface AudioFileInfo {
  file: File;
  duration: number; // in seconds
  durationFormatted: string; // formatted as MM:SS
}

/**
 * Get audio duration from a file
 */
export async function getAudioDuration(file: File): Promise<AudioFileInfo> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      URL.revokeObjectURL(url);
      resolve({
        file,
        duration,
        durationFormatted: formatDuration(duration)
      });
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio file'));
    });
    
    audio.src = url;
  });
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Check if two audio files have the same duration (within 1 second tolerance)
 */
export function areDurationsEqual(duration1: number, duration2: number, tolerance: number = 1): boolean {
  return Math.abs(duration1 - duration2) <= tolerance;
}

/**
 * Format duration difference for display
 */
export function formatDurationDifference(duration1: number, duration2: number): string {
  const diff = Math.abs(duration1 - duration2);
  const minutes = Math.floor(diff / 60);
  const seconds = Math.floor(diff % 60);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
}
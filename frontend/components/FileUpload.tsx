'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileUploadProps } from '@/types';
import { getAudioDuration } from '@/lib/audio-utils';
import { useToastHelpers, useApiErrorHandler } from '@/components/ToastNotifications';
import { UploadProgress } from '@/components/LoadingStates';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export function FileUpload({ 
  label, 
  required = false, 
  accept, 
  maxSize, 
  onFileSelect, 
  onDurationChange,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onAutoNavigate,
  error, 
  value,
  duration,
  durationFormatted,
  isUploading = false,
  uploadProgress,
  autoNavigate = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { success, error: showError } = useToastHelpers();
  const { handleApiError } = useApiErrorHandler();

  // Audio control functions
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const resetAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Clean up audio URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update audio URL when file changes
  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Reset audio state
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Validate file type
    if (!accept.split(',').some(type => file.type.match(type.trim()))) {
      showError('Invalid file type', `Please select a file with one of these formats: ${accept}`);
      return;
    }
    
    // Additional validation for video files
    if (file.type.startsWith('video/')) {
      if (file.type !== 'video/mp4') {
        showError('Unsupported video format', 'Only MP4 video files are supported');
        return;
      }
    }

    // Validate file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      showError('File too large', `File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      // Notify parent component about upload start
      onUploadProgress?.({
        progress: 0,
        status: 'validating',
        message: 'Validating file...'
      });

      // Get audio duration for validation
      const audioInfo = await getAudioDuration(file);
      
      // Notify parent component about validation complete
      onUploadProgress?.({
        progress: 100,
        status: 'complete',
        message: 'File validated successfully'
      });
      
      // Call parent callbacks
      onFileSelect(file);
      onDurationChange?.(audioInfo.duration);
      onUploadComplete?.(file);
      
      success('File validated successfully', `${file.name} is ready for upload`);
      
      // Auto-navigate to next step if enabled
      if (autoNavigate && onAutoNavigate) {
        // Add a small delay to show the success message before navigating
        setTimeout(() => {
          onAutoNavigate();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to validate file:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error validating your file. Please try again.';
      handleApiError(error, 'File Validation');
      onUploadError?.(errorMessage);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleClick();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-[var(--youtube-red)] ml-1">*</span>}
      </label>
      
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center touch-manipulation min-h-[120px] sm:min-h-[160px]
          transition-all duration-300 mobile-card
          ${value ? 'cursor-default' : 'cursor-pointer'}
          ${isDragOver && !value
            ? 'border-[var(--youtube-red)] bg-red-50 dark:bg-red-900/10' 
            : 'border-border hover:border-[var(--youtube-red)] hover:bg-muted/50'
          }
          ${error ? 'border-destructive' : ''}
        `}
        onDragOver={value ? undefined : handleDragOver}
        onDragLeave={value ? undefined : handleDragLeave}
        onDrop={value ? undefined : handleDrop}
        onClick={value ? undefined : handleClick}
        onTouchStart={value ? undefined : handleTouchStart}
        onTouchEnd={value ? undefined : handleTouchEnd}
        whileHover={value ? {} : { scale: 1.02 }}
        whileTap={value ? {} : { scale: 0.98 }}
        animate={{
          borderColor: isDragOver && !value ? 'var(--youtube-red)' : undefined,
          backgroundColor: isDragOver && !value ? 'rgba(255, 0, 0, 0.05)' : undefined
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {isUploading ? (
          <UploadProgress
            progress={uploadProgress?.progress || 0}
            fileName={value?.name || 'Uploading...'}
            status={uploadProgress?.status || 'uploading'}
            message={uploadProgress?.message}
            speed={uploadProgress?.speed}
            estimatedTime={uploadProgress?.estimatedTime}
            bytesUploaded={uploadProgress?.bytesUploaded}
            totalBytes={uploadProgress?.totalBytes}
          />
        ) : value ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* File Info */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[var(--youtube-red)] rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className="font-medium text-sm">{value.name}</p>
              <div className="text-xs text-muted-foreground space-y-1 mt-1">
                <p>{formatFileSize(value.size)}</p>
                {durationFormatted && (
                  <p className="text-[#ff0000] font-medium">
                    Duration: {durationFormatted}
                  </p>
                )}
              </div>
            </div>

            {/* Audio Preview Player */}
            {audioUrl && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                {/* Mobile-optimized controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
                  {/* Play/Pause and Reset buttons */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlayPause();
                      }}
                      className="flex items-center justify-center w-12 h-12 bg-[var(--youtube-red)] text-white rounded-full touch-manipulation mobile-audio-controls"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleTouchStart(e);
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetAudio();
                      }}
                      className="flex items-center justify-center w-10 h-10 bg-muted text-foreground rounded-full touch-manipulation mobile-audio-controls"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleTouchStart(e);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Volume controls - mobile optimized */}
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="flex items-center justify-center w-10 h-10 bg-muted text-foreground rounded-full touch-manipulation mobile-audio-controls"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        handleTouchStart(e);
                      }}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </motion.button>
                    
                    <div className="flex-1 sm:flex-none">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="w-full sm:w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer touch-manipulation mobile-progress"
                        style={{
                          background: `linear-gradient(to right, var(--youtube-red) 0%, var(--youtube-red) ${(isMuted ? 0 : volume) * 100}%, #e5e5e5 ${(isMuted ? 0 : volume) * 100}%, #e5e5e5 100%)`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Bar - Mobile Optimized */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      onClick={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer touch-manipulation mobile-progress"
                      style={{
                        background: `linear-gradient(to right, var(--youtube-red) 0%, var(--youtube-red) ${duration ? (currentTime / duration) * 100 : 0}%, #e5e5e5 ${duration ? (currentTime / duration) * 100 : 0}%, #e5e5e5 100%)`
                      }}
                    />
                    {/* Mobile touch area indicator */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="h-3 bg-transparent rounded-lg"
                        style={{ 
                          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                          background: 'rgba(255, 0, 0, 0.2)'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="font-mono">{formatTime(currentTime)}</span>
                    <span className="font-mono">{durationFormatted || '0:00'}</span>
                  </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      audioRef.current.volume = volume;
                    }
                  }}
                />
              </div>
            )}

            {/* Remove Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                // Reset all audio state when removing file
                setIsPlaying(false);
                setCurrentTime(0);
                setVolume(1);
                setIsMuted(false);
                // Call parent with null to remove file
                onFileSelect(null);
                onDurationChange?.(null);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Reset all audio state when removing file
                setIsPlaying(false);
                setCurrentTime(0);
                setVolume(1);
                setIsMuted(false);
                // Call parent with null to remove file
                onFileSelect(null);
                onDurationChange?.(null);
              }}
              className="touch-manipulation w-full"
            >
              Remove File
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4 flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground"
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </motion.div>
            <div className="text-center space-y-2">
              <p className="font-medium text-base sm:text-lg">
                {isDragOver ? 'Drop your file here' : 'Tap to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                {accept} (max {maxSize}MB)
              </p>
              {/* Mobile-specific hint */}
              <p className="text-xs text-muted-foreground sm:hidden">
                Tap anywhere in this area to select a file
              </p>
            </div>
          </motion.div>
        )}

      </motion.div>

      {error && (
        <motion.p
          className="text-sm text-destructive"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
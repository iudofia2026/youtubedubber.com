'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileUploadProps } from '@/types';
import { getAudioDuration } from '@/lib/audio-utils';
import { useToastHelpers } from '@/components/ToastNotifications';
import { UploadProgress } from '@/components/LoadingStates';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export function FileUpload({ 
  label, 
  required = false, 
  accept, 
  maxSize, 
  onFileSelect, 
  onDurationChange,
  error, 
  value,
  duration,
  durationFormatted
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | 'validating'>('uploading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { success, error: showError } = useToastHelpers();

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

    // Validate file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      showError('File too large', `File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Get audio duration
      setUploadStatus('validating');
      const audioInfo = await getAudioDuration(file);
      
      // Complete upload
      setUploadProgress(100);
      setUploadStatus('processing');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onFileSelect(file);
      onDurationChange?.(audioInfo.duration);
      
      success('File uploaded successfully', `${file.name} is ready for processing`);
    } catch (error) {
      console.error('Failed to process file:', error);
      showError('Upload failed', 'There was an error processing your file. Please try again.');
      onFileSelect(file);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
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
          relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer touch-manipulation
          transition-all duration-300
          ${isDragOver 
            ? 'border-[var(--youtube-red)] bg-red-50 dark:bg-red-900/10' 
            : 'border-border hover:border-[var(--youtube-red)] hover:bg-muted/50'
          }
          ${error ? 'border-destructive' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleClick();
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          borderColor: isDragOver ? 'var(--youtube-red)' : undefined,
          backgroundColor: isDragOver ? 'rgba(255, 0, 0, 0.05)' : undefined
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
            progress={uploadProgress}
            fileName={value?.name || 'Uploading...'}
            status={uploadStatus}
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
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayPause}
                    className="h-8 w-8 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAudio}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleMute}
                      className="h-8 w-8 p-0"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{durationFormatted || '0:00'}</span>
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
                onFileSelect(null as unknown as File);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFileSelect(null as unknown as File);
              }}
              className="touch-manipulation w-full"
            >
              Remove File
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 mx-auto text-muted-foreground">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-medium">
                {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                {accept} (max {maxSize}MB)
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
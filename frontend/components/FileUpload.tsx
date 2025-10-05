'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileUploadProps } from '@/types';
import { getAudioDuration } from '@/lib/audio-utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Validate file type
    if (!accept.split(',').some(type => file.type.match(type.trim()))) {
      return;
    }

    // Validate file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Get audio duration
      const audioInfo = await getAudioDuration(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onFileSelect(file);
      onDurationChange?.(audioInfo.duration);
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      onFileSelect(file);
    } finally {
      setIsUploading(false);
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-[var(--youtube-red)] ml-1">*</span>}
      </label>
      
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
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
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-12 h-12 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-full h-full text-[var(--youtube-red)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </motion.div>
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </motion.div>
        ) : value ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 mx-auto bg-[var(--youtube-red)] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">{value.name}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{formatFileSize(value.size)}</p>
                {durationFormatted && (
                  <p className="text-[#ff0000] font-medium">
                    Duration: {durationFormatted}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null as unknown as File);
              }}
            >
              Remove
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

        {/* YouTube-style play button overlay when file is selected */}
        {value && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-[var(--youtube-red)] rounded-full flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </motion.div>
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
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { FileUploadProps } from '@/types';

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  required = false,
  accept,
  maxSize,
  onFileSelect,
  error,
  value,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(value || null);
  const [validationError, setValidationError] = useState<string | null>(error || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `Please select a valid file type. Accepted types: ${accept}`;
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    setIsUploading(true);
    setValidationError(null);

    // Validate file
    const error = validateFile(selectedFile);
    if (error) {
      setValidationError(error);
      setIsUploading(false);
      return;
    }

    // Set file and call callback
    setFile(selectedFile);
    onFileSelect(selectedFile);
    setIsUploading(false);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('audio/')) {
      return <File className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const isError = validationError || error;
  const isSuccess = file && !isError;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <motion.div
        className={`
          relative w-full h-32 border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragOver ? 'border-primary bg-primary/5' : ''}
          ${isError ? 'border-destructive bg-destructive/5' : ''}
          ${isSuccess ? 'border-green-500 bg-green-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
          ${!isDragOver && !isError && !isSuccess ? 'border-border' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {isUploading ? (
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </motion.div>
          ) : file ? (
            <motion.div
              className="flex items-center space-x-3 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex-shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isDragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {accept} (max {maxSize}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {isError && (
        <motion.div
          className="flex items-center space-x-2 mt-2 text-destructive"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{validationError || error}</span>
        </motion.div>
      )}
    </div>
  );
};
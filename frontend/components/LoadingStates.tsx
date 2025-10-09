'use client';

import React from 'react';
import { Loader2, Upload, FileText, Languages, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent
        text-sm font-medium rounded-md shadow-sm text-white bg-red-600
        hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

interface LoadingCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  description,
  icon,
  className = ''
}) => {
  return (
    <div className={`
      flex items-center justify-center p-8 border-2 border-dashed
      border-gray-300 dark:border-gray-600 rounded-lg
      ${className}
    `}>
      <div className="text-center">
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'processing' | 'validating' | 'complete' | 'error';
  message?: string;
  speed?: number;
  estimatedTime?: number;
  bytesUploaded?: number;
  totalBytes?: number;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  status,
  message,
  speed,
  estimatedTime,
  bytesUploaded,
  totalBytes
}) => {
  const getStatusText = () => {
    if (message) return message;
    
    switch (status) {
      case 'uploading':
        return 'Uploading file...';
      case 'validating':
        return 'Validating file...';
      case 'processing':
        return 'Processing file...';
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return 'Processing...';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-5 w-5" />;
      case 'validating':
        return <FileText className="h-5 w-5" />;
      case 'processing':
        return <Languages className="h-5 w-5" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center space-x-3 mb-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getStatusText()}
          </p>
          {/* Additional upload info */}
          {(bytesUploaded && totalBytes) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatBytes(bytesUploaded)} of {formatBytes(totalBytes)}
              {speed && ` • ${formatSpeed(speed)}`}
              {estimatedTime && ` • ${formatTime(estimatedTime)} remaining`}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${
            status === 'complete' ? 'bg-green-500' : 
            status === 'error' ? 'bg-red-500' : 'bg-red-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

interface JobProgressProps {
  progress: number;
  stage: string;
  message: string;
  isComplete?: boolean;
}

export const JobProgress: React.FC<JobProgressProps> = ({
  progress,
  stage,
  message,
  isComplete = false
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {stage}
        </h4>
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <LoadingSpinner size="sm" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-red-600'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
};

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`
            h-4 bg-gray-200 dark:bg-gray-700 rounded
            ${i === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
        />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
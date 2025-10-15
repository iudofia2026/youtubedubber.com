'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X, 
  RefreshCw, 
  FileAudio, 
  Video, 
  FileText,
  Loader2,
  Play,
  Pause,
  Square,
  MoreVertical,
  Clock,
  HardDrive,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadItem, DownloadFileType } from '@/types';

interface DownloadCardProps {
  item: DownloadItem;
  onDownload: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onPreview?: () => void;
}

export function DownloadCard({ 
  item, 
  onDownload, 
  onCancel, 
  onRetry,
  onPreview 
}: DownloadCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getFileTypeIcon = (fileType: DownloadFileType) => {
    switch (fileType) {
      case 'voice':
        return <FileAudio className="w-4 h-4" />;
      case 'full':
        return <Video className="w-4 h-4" />;
      case 'captions':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileAudio className="w-4 h-4" />;
    }
  };

  const getFileTypeLabel = (fileType: DownloadFileType): string => {
    switch (fileType) {
      case 'voice':
        return 'Voice Only';
      case 'full':
        return 'Full Mix';
      case 'captions':
        return 'Captions';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'downloading':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'downloading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown duration';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpirationWarning = (expiresAt?: string): string | null => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiration = new Date(expiresAt);
    const hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiration < 0) return 'Expired';
    if (hoursUntilExpiration < 24) return `Expires in ${Math.round(hoursUntilExpiration)}h`;
    if (hoursUntilExpiration < 48) return `Expires in ${Math.round(hoursUntilExpiration)}h`;
    
    return null;
  };

  const isExpired = item.expiresAt ? new Date(item.expiresAt) < new Date() : false;
  const expirationWarning = getExpirationWarning(item.expiresAt);

  return (
    <motion.div
      className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
        isExpired ? 'opacity-60' : ''
      } ${getStatusColor(item.status)}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getFileTypeIcon(item.fileType)}
            <div>
              <h3 className="font-semibold text-foreground text-sm">
                {item.fileName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel(item.fileType)} • {item.languageName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
            <span className="capitalize">{item.status}</span>
          </div>

          {/* Expiration Warning */}
          {expirationWarning && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isExpired 
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
                : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              {expirationWarning}
            </div>
          )}

          {/* Details Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {item.status === 'downloading' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Downloading...</span>
            <span className="text-xs font-medium text-foreground">{item.progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-[#ff0000] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {item.status === 'failed' && item.error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">
            {item.error}
          </p>
        </div>
      )}

      {/* Details Section */}
      {showDetails && (
        <motion.div
          className="mb-3 p-3 bg-muted/50 rounded-lg space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            {item.fileSize && (
              <div className="flex items-center space-x-1">
                <HardDrive className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{formatFileSize(item.fileSize)}</span>
              </div>
            )}
            
            {item.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{formatDuration(item.duration)}</span>
              </div>
            )}
            
            {item.completedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium">{formatDate(item.completedAt)}</span>
              </div>
            )}
            
            {item.expiresAt && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium">{formatDate(item.expiresAt)}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Preview Button (if available) */}
          {onPreview && (item.fileType === 'voice' || item.fileType === 'full') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="flex items-center space-x-1"
            >
              <Play className="w-3 h-3" />
              <span className="text-xs">Preview</span>
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Primary Action Button */}
          {item.status === 'pending' && (
            <Button
              onClick={onDownload}
              size="sm"
              className="flex items-center space-x-1"
              disabled={isExpired}
            >
              <Download className="w-3 h-3" />
              <span className="text-xs">Download</span>
            </Button>
          )}

          {item.status === 'downloading' && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Square className="w-3 h-3" />
              <span className="text-xs">Cancel</span>
            </Button>
          )}

          {item.status === 'failed' && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs">Retry</span>
            </Button>
          )}

          {item.status === 'completed' && (
            <Button
              onClick={onDownload}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
              disabled={isExpired}
            >
              <Download className="w-3 h-3" />
              <span className="text-xs">Re-download</span>
            </Button>
          )}

          {item.status === 'cancelled' && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs">Retry</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expired Overlay */}
      {isExpired && (
        <div className="absolute inset-0 bg-red-50/80 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-red-600">File Expired</p>
            <p className="text-xs text-red-500">This file is no longer available for download</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
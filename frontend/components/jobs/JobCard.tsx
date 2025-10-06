'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  Languages,
  FileAudio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
  onView?: (jobId: string) => void;
  onDownload?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

export function JobCard({ job, onView, onDownload, onDelete }: JobCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'complete':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'processing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (job.status === 'complete') return 100;
    if (job.status === 'error') return 0;
    return job.progress || 0;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job #{job.id.slice(-8)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(job.createdAt)}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <FileAudio className="w-4 h-4" />
          <span>Duration: {formatDuration(job.voiceTrackDuration)}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Languages className="w-4 h-4" />
          <span>{job.targetLanguages.length} language{job.targetLanguages.length !== 1 ? 's' : ''}: {job.targetLanguages.join(', ')}</span>
        </div>

        {job.backgroundTrack && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <FileAudio className="w-4 h-4" />
            <span>Background track included</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {job.status === 'processing' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {job.message || 'Processing...'}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(job.id)}
            className="flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Button>
          
          {job.status === 'complete' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(job.id)}
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(job.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
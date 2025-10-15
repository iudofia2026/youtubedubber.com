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

  const getStatusGradient = () => {
    switch (job.status) {
      case 'complete':
        return 'from-green-50 via-emerald-50 to-green-100 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-green-800/20';
      case 'error':
        return 'from-red-50 via-rose-50 to-red-100 dark:from-red-900/20 dark:via-rose-900/10 dark:to-red-800/20';
      case 'pending':
        return 'from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:via-amber-900/10 dark:to-yellow-800/20';
      case 'processing':
        return 'from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-blue-800/20';
      default:
        return 'from-gray-50 via-gray-50 to-gray-100 dark:from-gray-900/20 dark:via-gray-900/10 dark:to-gray-800/20';
    }
  };

  const getStatusBorder = () => {
    switch (job.status) {
      case 'complete':
        return 'border-green-200 dark:border-green-700';
      case 'error':
        return 'border-red-200 dark:border-red-700';
      case 'pending':
        return 'border-yellow-200 dark:border-yellow-700';
      case 'processing':
        return 'border-blue-200 dark:border-blue-700';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${getStatusGradient()} rounded-xl border-2 ${getStatusBorder()} p-4 sm:p-6 hover:shadow-xl transition-all duration-300 touch-manipulation relative overflow-hidden`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        {job.status === 'complete' && (
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 bg-green-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        {job.status === 'error' && (
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 bg-red-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {job.status === 'processing' && (
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        {job.status === 'pending' && (
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2.8, repeat: Infinity }}
          />
        )}
      </div>
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div
            className="relative"
            animate={job.status === 'processing' ? { rotate: 360 } : {}}
            transition={job.status === 'processing' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
          >
            {job.status === 'complete' ? (
              <motion.div
                className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            ) : job.status === 'error' ? (
              <motion.div
                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="w-6 h-6 text-white" />
              </motion.div>
            ) : job.status === 'processing' ? (
              <motion.div
                className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -3, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Clock className="w-6 h-6 text-white" />
              </motion.div>
            )}
            
            {/* Status indicator dot */}
            <motion.div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                job.status === 'complete' ? 'bg-green-400' :
                job.status === 'error' ? 'bg-red-400' :
                job.status === 'processing' ? 'bg-blue-400' : 'bg-yellow-400'
              }`}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          
          <div>
            <motion.h3 
              className="text-xl font-bold text-gray-900 dark:text-white mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              🎬 Job #{job.id.slice(-8)}
            </motion.h3>
            <motion.p 
              className="text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {formatDate(job.createdAt)}
            </motion.p>
          </div>
        </div>
        
        <motion.div 
          className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getStatusColor()}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {job.status === 'complete' ? '✅ Complete' :
           job.status === 'error' ? '❌ Error' :
           job.status === 'processing' ? '⚡ Processing' : '⏳ Pending'}
        </motion.div>
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onView?.(job.id);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onView?.(job.id);
            }}
            className="flex items-center space-x-1 touch-manipulation flex-1 sm:flex-none"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Button>
          
          {job.status === 'complete' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload?.(job.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                onDownload?.(job.id);
              }}
              className="flex items-center space-x-1 touch-manipulation flex-1 sm:flex-none"
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
          onTouchEnd={(e) => {
            e.preventDefault();
            onDelete?.(job.id);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation self-end sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

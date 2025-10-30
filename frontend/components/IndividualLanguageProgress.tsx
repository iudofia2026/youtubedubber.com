'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Download, Loader2 } from 'lucide-react';
import { LanguageProgress } from '@/types';
import { JobProgress } from '@/components/LoadingStates';

interface IndividualLanguageProgressProps {
  language: LanguageProgress;
  onDownload?: (languageCode: string) => void;
}

export function IndividualLanguageProgress({ language, onDownload }: IndividualLanguageProgressProps) {
  const getStatusIcon = () => {
    switch (language.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Loader2 className="w-5 h-5 text-[#ff0000] animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (language.status) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-muted-foreground';
      default:
        return 'text-[#ff0000]';
    }
  };

  const getProgressBarColor = () => {
    switch (language.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-muted';
      default:
        return 'bg-[#ff0000]';
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className="border border-border bg-card/50 backdrop-blur-sm p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        borderColor: 'var(--youtube-red)',
        transition: { duration: 0.2 }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{language.flag || '🌐'}</span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {language.languageName || 'Unknown Language'}
            </h3>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {language.languageCode || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {language.status.charAt(0).toUpperCase() + language.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <JobProgress
        progress={language.progress}
        stage={language.status}
        message={language.message}
        isComplete={language.status === 'complete'}
      />

      {/* Additional Info */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          {language.estimatedTimeRemaining && language.status !== 'complete' && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(language.estimatedTimeRemaining)}</span>
            </div>
          )}
          {language.fileSize && (
            <div className="flex items-center space-x-1">
              <span>📁</span>
              <span>{formatFileSize(language.fileSize)}</span>
            </div>
          )}
        </div>
        
        {language.status === 'complete' && onDownload && language.languageCode && (
          <motion.button
            onClick={() => onDownload(language.languageCode)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#ff0000] text-white text-sm font-medium hover:bg-[#cc0000] transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </motion.button>
        )}
      </div>

      {/* Error State */}
      {language.status === 'error' && (
        <motion.div
          className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Processing failed. Please try again.</span>
        </motion.div>
      )}
    </motion.div>
  );
}
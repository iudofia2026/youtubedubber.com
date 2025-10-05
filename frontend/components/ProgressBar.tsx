'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ProgressBarProps } from '@/types';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  isComplete,
  showPercentage = true,
  animated = true,
}) => {
  const getStatusIcon = () => {
    if (isComplete) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (progress === 0) {
      return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
    return <Clock className="w-5 h-5 text-primary" />;
  };

  const getStatusColor = () => {
    if (isComplete) return 'text-green-600';
    if (progress === 0) return 'text-muted-foreground';
    return 'text-primary';
  };

  const getProgressBarColor = () => {
    if (isComplete) return 'bg-green-500';
    if (progress === 0) return 'bg-muted';
    return 'bg-primary';
  };

  const getProgressBarWidth = () => {
    return Math.max(0, Math.min(100, progress));
  };

  return (
    <div className="w-full space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {isComplete ? 'Processing Complete' : 'Processing Audio'}
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {status}
            </p>
          </div>
        </div>
        {showPercentage && (
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full">
        <div className="w-full bg-muted h-2 relative overflow-hidden">
          <motion.div
            className={`h-full ${getProgressBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressBarWidth()}%` }}
            transition={
              animated
                ? {
                    duration: 0.5,
                    ease: 'easeOut',
                  }
                : { duration: 0 }
            }
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className={progress >= 0 ? 'text-primary font-medium' : ''}>
          Upload
        </span>
        <span className={progress >= 25 ? 'text-primary font-medium' : ''}>
          Process
        </span>
        <span className={progress >= 50 ? 'text-primary font-medium' : ''}>
          Generate
        </span>
        <span className={progress >= 75 ? 'text-primary font-medium' : ''}>
          Finalize
        </span>
        <span className={progress >= 100 ? 'text-green-600 font-medium' : ''}>
          Complete
        </span>
      </div>

      {/* Status Message */}
      <motion.div
        className="text-center"
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm text-muted-foreground">
          {isComplete
            ? 'Your dubbing job has been completed successfully!'
            : 'Please wait while we process your audio files...'}
        </p>
      </motion.div>

      {/* Completion Animation */}
      {isComplete && (
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 10,
            delay: 0.2,
          }}
        >
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Ready for Download!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
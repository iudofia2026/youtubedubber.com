'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useApiErrorHandler } from '@/components/ToastNotifications';

interface ErrorRecoveryProps {
  error: any;
  onRetry: () => Promise<void>;
  onDismiss?: () => void;
  context?: string;
  maxRetries?: number;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
  context = 'Operation',
  maxRetries = 3,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRetryError, setLastRetryError] = useState<any>(null);
  const { handleApiError } = useApiErrorHandler();

  const handleRetry = async () => {
    if (retryCount >= maxRetries) {
      handleApiError(new Error('Maximum retry attempts exceeded'), context);
      return;
    }

    setIsRetrying(true);
    setLastRetryError(null);

    try {
      await onRetry();
      setRetryCount(0);
      setLastRetryError(null);
    } catch (error) {
      setLastRetryError(error);
      setRetryCount(prev => prev + 1);
      handleApiError(error, `${context} (Retry ${retryCount + 1})`);
    } finally {
      setIsRetrying(false);
    }
  };

  const canRetry = retryCount < maxRetries && error?.retryable !== false;

  return (
    <motion.div
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
            {context} Failed
          </h4>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {error?.message || 'An unexpected error occurred'}
          </p>
          
          {retryCount > 0 && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
          
          {lastRetryError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Last retry failed: {lastRetryError?.message || 'Unknown error'}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1">
                {isRetrying ? 'Retrying...' : 'Retry'}
              </span>
            </Button>
          )}
          
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900/30"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {retryCount >= maxRetries && (
        <motion.div
          className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <div className="flex items-center space-x-2">
            <X className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">
              Maximum retry attempts reached. Please try again later or contact support.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Hook for managing retry state
export const useRetryState = (maxRetries: number = 3) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<any>(null);

  const canRetry = retryCount < maxRetries;

  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    onError?: (error: any, retryCount: number) => void
  ): Promise<T> => {
    setIsRetrying(true);
    setLastError(null);

    try {
      const result = await operation();
      setRetryCount(0);
      return result;
    } catch (error) {
      setLastError(error);
      setRetryCount(prev => prev + 1);
      
      if (onError) {
        onError(error, retryCount + 1);
      }
      
      throw error;
    } finally {
      setIsRetrying(false);
    }
  };

  const reset = () => {
    setRetryCount(0);
    setIsRetrying(false);
    setLastError(null);
  };

  return {
    retryCount,
    isRetrying,
    lastError,
    canRetry,
    executeWithRetry,
    reset
  };
};
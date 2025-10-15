'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download, 
  Trash2,
  Languages,
  FileAudio,
  Video,
  Zap,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadManager } from '@/components/downloads/DownloadManager';
import { Job } from '@/types';

interface JobListItemProps {
  job: Job;
  onView?: (jobId: string) => void;
  onDownload?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
}

export function JobListItem({ job, onView, onDownload, onDelete }: JobListItemProps) {
  const isViewEnabled = Boolean(onView);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showDownloadManager, setShowDownloadManager] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    if (!isViewEnabled) return;
    onView?.(job.id);
  };

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isViewEnabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView?.(job.id);
    }
  };

  // Touch gesture handlers for mobile swipe actions
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
    setIsPressed(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isUpSwipe = distanceY > 50;
    const isDownSwipe = distanceY < -50;
    
    // Show actions on left swipe
    if (isLeftSwipe && Math.abs(distanceY) < 100) {
      setShowActions(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    // Hide actions on right swipe
    if (isRightSwipe && Math.abs(distanceY) < 100) {
      setShowActions(false);
    }
    
    // Close actions on tap
    if (Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10) {
      if (showActions) {
        setShowActions(false);
      } else {
        handleCardClick();
      }
    }
  }, [touchStart, touchEnd, showActions, handleCardClick]);

  // Handle action button clicks
  const handleActionClick = useCallback((action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setShowActions(false);
  }, []);

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
      ref={itemRef}
      className={`bg-gradient-to-r ${getStatusGradient()} rounded-xl border-2 ${getStatusBorder()} p-4 sm:p-6 transition-all duration-300 touch-manipulation relative overflow-hidden mobile-card ${isViewEnabled ? 'hover:shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500' : ''} ${isPressed ? 'scale-98' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: 1, 
        x: showActions ? -100 : 0,
        scale: isPressed ? 0.99 : 1
      }}
      whileHover={isViewEnabled ? { scale: 1.01, x: 5 } : undefined}
      whileTap={isViewEnabled ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.3 }}
      role={isViewEnabled ? 'button' : undefined}
      tabIndex={isViewEnabled ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        {job.status === 'complete' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        {job.status === 'error' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {job.status === 'processing' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        {job.status === 'pending' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-2xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2.8, repeat: Infinity }}
          />
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        {/* Left Section - Job Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Status Icon */}
          <motion.div
            className="relative flex-shrink-0"
            animate={job.status === 'processing' ? { rotate: 360 } : {}}
            transition={job.status === 'processing' ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
          >
            {job.status === 'complete' ? (
              <motion.div
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
            ) : job.status === 'error' ? (
              <motion.div
                className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
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
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6 text-white" />
                {/* Progress Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0deg, transparent ${360 - (getProgressPercentage() * 3.6)}deg, rgba(255,255,255,0.3) ${360 - (getProgressPercentage() * 3.6)}deg, rgba(255,255,255,0.3) 360deg)`
                  }}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
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

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <motion.h3 
                className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Video className="w-5 h-5 text-[#ff0000]" />
                <span>Job #{job.id.slice(-8)}</span>
              </motion.h3>
              
              <motion.div 
                className={`px-3 py-1 rounded-lg text-sm font-bold shadow-lg flex items-center space-x-2 ${getStatusColor()}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {job.status === 'complete' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete</span>
                  </>
                ) : job.status === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Error</span>
                  </>
                ) : job.status === 'processing' ? (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Pending</span>
                  </>
                )}
              </motion.div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FileAudio className="w-4 h-4" />
                <span>{formatDuration(job.voiceTrackDuration)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Languages className="w-4 h-4" />
                <span>{job.targetLanguages.length} language{job.targetLanguages.length !== 1 ? 's' : ''}: {job.targetLanguages.join(', ')}</span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-500">
                {formatDate(job.createdAt)}
              </div>

              {job.backgroundTrack && (
                <div className="flex items-center space-x-1 text-xs">
                  <FileAudio className="w-3 h-3" />
                  <span>Background track</span>
                </div>
              )}

              {/* Inline Progress for Processing Jobs */}
              {job.status === 'processing' && (
                <motion.div 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-700"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                  <div className="w-20 bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 relative overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 h-1.5 rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Processing Message and Language Progress */}
            {job.status === 'processing' && (
              <div className="mt-2 space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                  {job.message || 'Processing...'}
                </div>
                
                {/* Language Progress Dots */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-500">Languages:</span>
                  <div className="flex items-center space-x-1">
                    {job.targetLanguages.map((lang, index) => {
                      const isCompleted = index < (job.completedLanguages || 0);
                      return (
                        <motion.div
                          key={lang}
                          className={`w-2 h-2 rounded-full ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        />
                      );
                    })}
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                      {job.completedLanguages || 0}/{job.targetLanguages.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Swipe Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 flex items-center justify-end pr-4 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                {isViewEnabled && (
                  <motion.button
                    onClick={(e) => handleActionClick(() => onView?.(job.id), e)}
                    className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full touch-manipulation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                )}
                
                {job.status === 'complete' && onDownload && (
                  <motion.button
                    onClick={(e) => handleActionClick(() => setShowDownloadManager(true), e)}
                    className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full touch-manipulation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                )}
                
                {onDelete && (
                  <motion.button
                    onClick={(e) => handleActionClick(() => onDelete?.(job.id), e)}
                    className="flex items-center justify-center w-12 h-12 bg-red-500 text-white rounded-full touch-manipulation"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
          {job.status === 'complete' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                setShowDownloadManager(true);
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDownload?.(job.id);
              }}
              className="flex items-center space-x-1 touch-manipulation"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          )}

          {isViewEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onView?.(job.id);
              }}
              onTouchEnd={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onView?.(job.id);
              }}
              className="flex items-center space-x-1 touch-manipulation"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(job.id);
            }}
            onTouchEnd={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete?.(job.id);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile Action Indicator */}
        <div className="sm:hidden flex items-center justify-center">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>Swipe left</span>
            <MoreVertical className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Download Manager Modal */}
      <AnimatePresence>
        {showDownloadManager && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDownloadManager(false);
              }
            }}
          >
            <motion.div
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <DownloadManager
                job={job}
                onClose={() => setShowDownloadManager(false)}
                onDownloadComplete={(item) => {
                  console.log('Download completed:', item);
                }}
                onDownloadError={(item, error) => {
                  console.error('Download error:', item, error);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
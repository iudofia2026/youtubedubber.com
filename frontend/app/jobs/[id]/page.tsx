'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle, Clock, Globe, Zap, FileAudio, Settings, Activity, AlertTriangle, Info, Play, Volume2, Share2, Copy, Timer, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ProgressBar';
import { IndividualLanguageProgress } from '@/components/IndividualLanguageProgress';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { pollJobStatus } from '@/lib/api';
import { GetJobStatusResponse, LanguageProgress, LANGUAGES } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ToastNotifications';

export default function JobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const jobId = params.id as string;

  const queryLanguageCodes = React.useMemo(() => {
    const languagesParam = searchParams?.get('languages');
    if (!languagesParam) {
      return [];
    }
    return languagesParam
      .split(',')
      .map(code => decodeURIComponent(code.trim()))
      .filter(Boolean);
  }, [searchParams]);

  const fallbackLanguageProgress = React.useMemo<LanguageProgress[]>(() => {
    return queryLanguageCodes.map(code => {
      const languageInfo = LANGUAGES.find(lang => lang.code === code);
      return {
        languageCode: code,
        languageName: languageInfo?.name || code.toUpperCase(),
        flag: languageInfo?.flag || '🌐',
        status: 'pending',
        progress: 0,
        message: 'Waiting to start',
      };
    });
  }, [queryLanguageCodes]);

  const buildInitialJobStatus = React.useCallback((): GetJobStatusResponse => ({
    id: jobId,
    status: 'uploading',
    progress: 0,
    message: 'Loading job status...',
    languages: fallbackLanguageProgress,
    totalLanguages: fallbackLanguageProgress.length || queryLanguageCodes.length,
    completedLanguages: 0,
    startedAt: new Date().toISOString(),
  }), [jobId, fallbackLanguageProgress, queryLanguageCodes]);

  const [jobStatus, setJobStatus] = useState<GetJobStatusResponse>(() => buildInitialJobStatus());
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollAttempt, setPollAttempt] = useState(0);
  const stopPollingRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(false);
  const hasShownTerminalErrorRef = useRef(false);

  useEffect(() => {
    setJobStatus(buildInitialJobStatus());
    setIsComplete(false);
    setIsError(false);
    setErrorMessage(null);
  }, [buildInitialJobStatus]);

  const clearPolling = React.useCallback(() => {
    if (stopPollingRef.current) {
      stopPollingRef.current();
      stopPollingRef.current = null;
    }
  }, []);

  const showTerminalErrorToast = React.useCallback((message: string) => {
    addToast({
      type: 'error',
      title: 'Job status unavailable',
      message,
      duration: 7000,
      action: {
        label: 'Back to Jobs',
        onClick: () => router.push('/jobs'),
      },
    });
  }, [addToast, router]);

  useEffect(() => {
    if (!jobId) {
      router.push('/jobs');
      return;
    }

    clearPolling();
    isMountedRef.current = true;
    hasShownTerminalErrorRef.current = false;

    const stopPolling = pollJobStatus(
      jobId,
      queryLanguageCodes,
      (status) => {
        if (!isMountedRef.current) {
          return;
        }

        const hasApiLanguages = status.languages && status.languages.length > 0;
        const languagesToUse = hasApiLanguages ? status.languages : fallbackLanguageProgress;
        const completedLanguages = status.completedLanguages || languagesToUse.filter(lang => lang.status === 'complete').length;

        setJobStatus(prev => ({
          ...status,
          languages: languagesToUse,
          totalLanguages: status.totalLanguages || languagesToUse.length || prev.totalLanguages,
          completedLanguages,
        }));

        const jobFinished = status.status === 'complete';
        const jobErrored = status.status === 'error';

        setIsComplete(jobFinished);
        setIsError(jobErrored);
        setErrorMessage(jobErrored ? status.message : null);

        if (!jobErrored) {
          hasShownTerminalErrorRef.current = false;
        }
      },
      () => {
        if (!isMountedRef.current) {
          return;
        }
        setIsComplete(true);
        setIsError(false);
        setErrorMessage(null);
      },
      (error) => {
        if (!isMountedRef.current) {
          return;
        }

        const message = error?.message || 'Failed to fetch job status';
        const errorWithMeta = error as Error & { terminal?: boolean };
        const isTerminalError = Boolean(errorWithMeta?.terminal);

        setIsComplete(false);
        setIsError(isTerminalError);
        setErrorMessage(message);
        setJobStatus(prev => ({
          ...prev,
          status: isTerminalError ? 'error' : prev.status,
          message,
        }));

        if (isTerminalError && !hasShownTerminalErrorRef.current) {
          hasShownTerminalErrorRef.current = true;
          showTerminalErrorToast(message);
        }
      }
    );

    stopPollingRef.current = () => {
      stopPolling();
      stopPollingRef.current = null;
    };

    return () => {
      isMountedRef.current = false;
      clearPolling();
    };
  }, [
    jobId,
    router,
    queryLanguageCodes,
    fallbackLanguageProgress,
    clearPolling,
    showTerminalErrorToast,
    pollAttempt,
  ]);

  const restartPolling = React.useCallback(() => {
    if (!jobId) {
      return;
    }
    hasShownTerminalErrorRef.current = false;
    clearPolling();
    setJobStatus(buildInitialJobStatus());
    setIsComplete(false);
    setIsError(false);
    setErrorMessage(null);
    setPollAttempt(prev => prev + 1);
  }, [buildInitialJobStatus, clearPolling, jobId]);

  // Show loading state if jobId is not available
  if (!jobId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job status...</p>
          <p className="text-xs text-muted-foreground mt-2">Job ID: {jobId || 'undefined'}</p>
        </div>
      </div>
    );
  }

  const handleDownload = (languageCode: string) => {
    const language = jobStatus.languages.find(lang => lang.languageCode === languageCode);
    if (language?.downloadUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = language.downloadUrl;
      link.download = `${jobId}_${languageCode}_dub.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error(`No download URL available for language ${languageCode}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const formatEstimatedCompletion = (dateString?: string) => {
    if (!dateString) return 'Calculating...';
    const now = new Date();
    const future = new Date(dateString);
    const diffInSeconds = Math.floor((future.getTime() - now.getTime()) / 1000);
    
    if (diffInSeconds <= 0) return 'Any moment now';
    if (diffInSeconds < 60) return `${diffInSeconds}s remaining`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m remaining`;
    return `${Math.floor(diffInSeconds / 3600)}h remaining`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/jobs" />
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {/* Compact Header */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4">
              <Link
                href="/jobs"
                className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to Jobs</span>
              </Link>
              <div className="h-4 w-px bg-border"></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Job {jobId.slice(-8)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isComplete ? 'Completed' : isError ? 'Error' : 'Processing'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isComplete ? (
                <motion.div
                  className="flex items-center space-x-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Complete</span>
                </motion.div>
              ) : isError ? (
                <motion.div
                  className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center space-x-2 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Processing</span>
                </motion.div>
              )}
              
              <Link
                href="/new"
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#ff0000] hover:text-white hover:bg-[#ff0000] border border-[#ff0000] rounded-lg transition-all duration-200 group"
              >
                <span>New Job</span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Error Banner */}
          {isError && (
            <motion.div
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Unable to load job status</h3>
                    <p className="text-xs text-muted-foreground">
                      {errorMessage || 'Something went wrong while retrieving the latest progress.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={restartPolling}
                  className="text-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Progress & Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Progress Card */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Overall Progress</h2>
                  <div className="text-2xl font-bold text-foreground">{jobStatus.progress}%</div>
                </div>
                
                <ProgressBar
                  progress={jobStatus.progress}
                  status={jobStatus.message}
                  isComplete={isComplete}
                  showPercentage={false}
                  animated={true}
                />
                
                <div className="mt-4 text-sm text-muted-foreground">
                  {isError ? errorMessage : jobStatus.message}
                </div>
              </motion.div>

              {/* Language Progress Grid */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Language Progress</h2>
                  <div className="text-sm text-muted-foreground">
                    {jobStatus.completedLanguages} of {jobStatus.totalLanguages} complete
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {jobStatus.languages.map((language, index) => (
                      <motion.div
                        key={language.languageCode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <IndividualLanguageProgress
                          language={language}
                          onDownload={handleDownload}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-[#ff0000]" />
                      <span className="text-sm text-muted-foreground">Languages</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      {jobStatus.completedLanguages}/{jobStatus.totalLanguages}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-[#ff0000]" />
                      <span className="text-sm text-muted-foreground">Started</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatTimeAgo(jobStatus.startedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#ff0000]" />
                      <span className="text-sm text-muted-foreground">ETA</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {isComplete ? 'Complete' : formatEstimatedCompletion(jobStatus.estimatedCompletion)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Job Info */}
              <motion.div
                className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-foreground">Job Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Job ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">
                        {jobId.slice(-8)}
                      </span>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex items-center space-x-2">
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isError ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        isComplete ? 'text-green-600' : 
                        isError ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {isComplete ? 'Complete' : isError ? 'Error' : 'Processing'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            isComplete ? 'bg-green-500' : 
                            isError ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${jobStatus.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{jobStatus.progress}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {isComplete && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#ff0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                )}
                
                <Link href="/new" className="block">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-[#ff0000] text-[#ff0000] rounded-lg hover:bg-[#ff0000] hover:text-white transition-colors">
                    <span>Create New Job</span>
                  </button>
                </Link>
                
                <Link href="/jobs" className="block">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                    <span>View All Jobs</span>
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

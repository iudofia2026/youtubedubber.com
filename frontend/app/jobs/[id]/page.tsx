'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle, Clock, Globe, Zap, FileAudio, Settings, Activity, AlertTriangle, Info, Play, Volume2, Share2, Copy } from 'lucide-react';
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
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Breadcrumbs items={breadcrumbConfigs.jobDetail(jobId)} />
        </motion.div>

        {/* Creative Status Banner with Animated Elements */}
        <motion.div
          className={`mb-8 rounded-xl p-6 relative overflow-hidden ${
            isComplete 
              ? 'bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-50 dark:from-green-900/20 dark:via-green-800/10 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700' 
              : isError || jobStatus.status === 'error'
              ? 'bg-gradient-to-br from-red-50 via-red-100/50 to-rose-50 dark:from-red-900/20 dark:via-red-800/10 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-700'
              : jobStatus.status === 'processing'
              ? 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-cyan-50 dark:from-blue-900/20 dark:via-blue-800/10 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700'
              : 'bg-gradient-to-br from-yellow-50 via-amber-100/50 to-orange-50 dark:from-yellow-900/20 dark:via-amber-800/10 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700'
          }`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            {isComplete ? (
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            ) : isError || jobStatus.status === 'error' ? (
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ) : jobStatus.status === 'processing' ? (
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            ) : (
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2.8, repeat: Infinity }}
              />
            )}
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isComplete ? (
                  <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : isError || jobStatus.status === 'error' ? (
                  <motion.div
                    className="relative"
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">!</span>
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </motion.div>
                ) : jobStatus.status === 'processing' ? (
                  <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="relative"
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </motion.div>
                )}
                
                <div>
                  <motion.h2 
                    className="text-2xl font-bold text-foreground mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {isComplete ? '🎉 Job Complete!' : 
                     isError || jobStatus.status === 'error' ? '⚠️ Job Error' :
                     jobStatus.status === 'processing' ? '⚡ Processing Job' : '⏳ Pending Job'}
                  </motion.h2>
                  <motion.p 
                    className="text-base text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {isError ? errorMessage : jobStatus.message}
                  </motion.p>
                </div>
              </div>
              
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="text-4xl font-bold text-foreground mb-1">
                  {jobStatus.progress}%
                </div>
                <div className="text-sm text-muted-foreground font-medium">Complete</div>
                <motion.div 
                  className="mt-2 w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.div
                    className={`h-full rounded-full ${
                      isComplete ? 'bg-green-500' : 
                      isError || jobStatus.status === 'error' ? 'bg-red-500' :
                      jobStatus.status === 'processing' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${jobStatus.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {isError && (
          <motion.div
            className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Unable to load job status</h3>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage || 'Something went wrong while retrieving the latest progress. Please try again or return to your jobs list.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors duration-200"
                >
                  Back to Jobs
                </Link>
                <button
                  onClick={restartPolling}
                  className="inline-flex items-center justify-center rounded-md bg-[#ff0000] px-4 py-2 text-sm font-medium text-white hover:bg-[#cc0000] transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/jobs"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Jobs</span>
            </Link>
            
            <Link
              href="/new"
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#ff0000] hover:text-white hover:bg-[#ff0000] border border-[#ff0000] rounded-lg transition-all duration-200 group"
            >
              <span>New Job</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">
                Dubbing Progress
              </h1>
              <p className="text-lg text-muted-foreground">
                Job ID: <span className="font-mono text-[#ff0000]">{jobId}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <motion.div
                  className="flex items-center space-x-2 text-green-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-8 h-8" />
                  <span className="font-medium">Complete</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center space-x-2 text-[#ff0000]"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-8 h-8" />
                  <span className="font-medium">Processing</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ProgressBar
            progress={jobStatus.progress}
            status={jobStatus.message}
            isComplete={isComplete}
            showPercentage={true}
            animated={true}
          />
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border p-6 space-y-2">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-[#ff0000]" />
              <h3 className="text-lg font-semibold text-foreground">Languages</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {jobStatus.completedLanguages}/{jobStatus.totalLanguages}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border p-6 space-y-2">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-[#ff0000]" />
              <h3 className="text-lg font-semibold text-foreground">Started</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatTimeAgo(jobStatus.startedAt)}
            </p>
            <p className="text-sm text-muted-foreground">Time elapsed</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border p-6 space-y-2">
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-[#ff0000]" />
              <h3 className="text-lg font-semibold text-foreground">ETA</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isComplete ? 'Complete' : formatEstimatedCompletion(jobStatus.estimatedCompletion)}
            </p>
            <p className="text-sm text-muted-foreground">
              {isComplete ? 'All done!' : 'Estimated completion'}
            </p>
          </div>
        </motion.div>

        {/* Individual Language Progress */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Language Progress
            </h2>
            <div className="text-sm text-muted-foreground">
              {jobStatus.completedLanguages} of {jobStatus.totalLanguages} complete
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Comprehensive Job Details */}
        <motion.div
          className="mt-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Job Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileAudio className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Audio Files</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice Track:</span>
                  <span className="font-medium text-foreground">3:00 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Background:</span>
                  <span className="font-medium text-foreground">3:00 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium text-foreground">High (48kHz)</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Languages</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium text-foreground">3 languages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-medium text-foreground">{jobStatus.completedLanguages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium text-foreground">{jobStatus.totalLanguages - jobStatus.completedLanguages}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Settings</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voice Model:</span>
                  <span className="font-medium text-foreground">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="font-medium text-foreground">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-medium text-foreground">Standard</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border border-orange-200 dark:border-orange-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground">Activity</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-foreground">{formatTimeAgo(jobStatus.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span className="font-medium text-foreground">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ETA:</span>
                  <span className="font-medium text-foreground">
                    {isComplete ? 'Complete' : formatEstimatedCompletion(jobStatus.estimatedCompletion)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Information */}
            <motion.div
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff0000] rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Job Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Job ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-foreground bg-muted px-2 py-1 rounded text-sm">{jobId}</span>
                    <button className="p-1 hover:bg-muted rounded transition-colors">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Status</span>
                  <div className="flex items-center space-x-2">
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : isError || jobStatus.status === 'error' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500" />
                    )}
                    <span className={`font-medium ${
                      isComplete ? 'text-green-600' : 
                      isError || jobStatus.status === 'error' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {isComplete ? 'Complete' : jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isComplete ? 'bg-green-500' : 
                          isError || jobStatus.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${jobStatus.progress}%` }}
                        transition={{ duration: 1, delay: 1 }}
                      />
                    </div>
                    <span className="text-foreground font-medium">{jobStatus.progress}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground font-medium">Started</span>
                  <span className="text-foreground font-medium">{formatTimeAgo(jobStatus.startedAt)}</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-muted-foreground font-medium">Estimated Completion</span>
                  <span className="text-foreground font-medium">
                    {isComplete ? 'Complete' : formatEstimatedCompletion(jobStatus.estimatedCompletion)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Audio Preview & Actions */}
            <motion.div
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Audio Preview</h3>
              </div>
              
              <div className="space-y-4">
                {/* Original Audio */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileAudio className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Original Voice Track</span>
                    </div>
                    <span className="text-sm text-muted-foreground">3:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="w-8 h-8 bg-[#ff0000] rounded-full flex items-center justify-center hover:bg-[#cc0000] transition-colors">
                      <Play className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-[#ff0000] rounded-full"></div>
                    </div>
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Background Audio */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileAudio className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Background Track</span>
                    </div>
                    <span className="text-sm text-muted-foreground">3:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="w-8 h-8 bg-[#ff0000] rounded-full flex items-center justify-center hover:bg-[#cc0000] transition-colors">
                      <Play className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-[#ff0000] rounded-full"></div>
                    </div>
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-[#ff0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download All</span>
                  </button>
                  <button className="flex items-center justify-center px-4 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          {isError && (
            <motion.button
              onClick={restartPolling}
              className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          )}
          <Link href="/new">
            <motion.button
              className="w-full sm:w-auto px-6 py-3 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-white transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create New Job
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              className="w-full sm:w-auto px-6 py-3 bg-[#ff0000] text-white hover:bg-[#cc0000] transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

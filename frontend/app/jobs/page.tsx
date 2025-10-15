'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BarChart } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { JobHistory } from '@/components/jobs/JobHistory';
import { DownloadHistorySection } from '@/components/downloads/DownloadHistorySection';
import { Job } from '@/types';
import { useToastHelpers } from '@/components/ToastNotifications';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'complete' | 'error'>('all');
  const { error: showError } = useToastHelpers();

  // Initialize status filter from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const status = searchParams.get('status') as 'all' | 'pending' | 'processing' | 'complete' | 'error';
    if (status && ['all', 'pending', 'processing', 'complete', 'error'].includes(status)) {
      setStatusFilter(status);
    } else {
      setStatusFilter('all');
    }
  }, [searchParams]);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock job data
        const mockJobs: Job[] = [
          {
            id: 'job_12345678',
            status: 'complete',
            progress: 100,
            message: 'All languages completed successfully',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            voiceTrackDuration: 180,
            targetLanguages: ['es', 'fr', 'de'],
            backgroundTrack: true,
            completedLanguages: 3,
            totalLanguages: 3,
            downloadUrls: {
              'es': { voice: '/download/es/voice', full: '/download/es/full' },
              'fr': { voice: '/download/fr/voice', full: '/download/fr/full' },
              'de': { voice: '/download/de/voice', full: '/download/de/full' }
            }
          },
          {
            id: 'job_87654321',
            status: 'processing',
            progress: 65,
            message: 'Generating Spanish dub...',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            voiceTrackDuration: 240,
            targetLanguages: ['ja', 'ko', 'zh'],
            backgroundTrack: false,
            completedLanguages: 1,
            totalLanguages: 3,
            estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
          },
          {
            id: 'job_11223344',
            status: 'pending',
            progress: 0,
            message: 'Waiting in queue...',
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            voiceTrackDuration: 120,
            targetLanguages: ['pt', 'it'],
            backgroundTrack: true,
            completedLanguages: 0,
            totalLanguages: 2
          },
          {
            id: 'job_55667788',
            status: 'error',
            progress: 0,
            message: 'Audio file validation failed',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            voiceTrackDuration: 90,
            targetLanguages: ['ru', 'ar'],
            backgroundTrack: false,
            completedLanguages: 0,
            totalLanguages: 2
          }
        ];
        
        setJobs(mockJobs);
      } catch {
        showError('Failed to load jobs', 'There was an error loading your jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove showError from dependencies to prevent infinite re-renders

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real app, would refetch from API
    } catch {
      showError('Refresh failed', 'There was an error refreshing the jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    if (!jobId) {
      showError('Job unavailable', 'We could not open that job. Please try again.');
      return;
    }

    const selectedJob = jobs.find(job => job.id === jobId);

    if (selectedJob && typeof window !== 'undefined') {
      try {
        const storageKey = `yt-dubber:job-preview:${jobId}`;
        window.sessionStorage.setItem(storageKey, JSON.stringify(selectedJob));
      } catch {
        // Cache failures are non-critical; continue without blocking navigation
      }
    }

    const query = selectedJob?.targetLanguages?.length
      ? `?${new URLSearchParams({ languages: selectedJob.targetLanguages.join(',') }).toString()}`
      : '';

    router.push(`/jobs/${jobId}${query}`);
  };

  const handleDownloadJob = (jobId: string) => {
    void jobId;
    // In real app, this would trigger a download
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch {
      showError('Delete failed', 'There was an error deleting the job. Please try again.');
    }
  };

  const handleStatusFilterChange = (status: 'all' | 'pending' | 'processing' | 'complete' | 'error') => {
    setStatusFilter(status);
    
    // Update URL to reflect the status change
    const params = new URLSearchParams(window.location.search);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/jobs${newURL}`, { scroll: false });
  };

  // Dynamic styling based on status filter
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Pending Jobs',
          description: '',
          iconBg: 'from-yellow-500 to-orange-500',
          accentColor: 'text-yellow-600',
          bgGradient: 'from-yellow-500/10 via-transparent to-yellow-500/10',
          blurColor: 'bg-yellow-500/10'
        };
      case 'processing':
        return {
          title: 'Processing Jobs',
          description: '',
          iconBg: 'from-blue-500 to-cyan-500',
          accentColor: 'text-blue-600',
          bgGradient: 'from-blue-500/10 via-transparent to-blue-500/10',
          blurColor: 'bg-blue-500/10'
        };
      case 'complete':
        return {
          title: 'Completed Jobs',
          description: '',
          iconBg: 'from-green-500 to-emerald-500',
          accentColor: 'text-green-600',
          bgGradient: 'from-green-500/10 via-transparent to-green-500/10',
          blurColor: 'bg-green-500/10'
        };
      case 'error':
        return {
          title: 'Failed Jobs',
          description: '',
          iconBg: 'from-red-500 to-pink-500',
          accentColor: 'text-red-600',
          bgGradient: 'from-red-500/10 via-transparent to-red-500/10',
          blurColor: 'bg-red-500/10'
        };
      default:
        return {
          title: 'Your Jobs',
          description: 'Manage and track your dubbing jobs',
          iconBg: 'from-[#ff0000] to-[#cc0000]',
          accentColor: 'text-[#ff0000]',
          bgGradient: 'from-[#ff0000]/5 via-transparent to-[#ff0000]/5',
          blurColor: 'bg-[#ff0000]/10'
        };
    }
  };

  const statusConfig = getStatusConfig(statusFilter);

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
          <Breadcrumbs items={breadcrumbConfigs.jobs} />
        </motion.div>

        {/* Simple Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`w-12 h-12 bg-gradient-to-br ${statusConfig.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
                key={statusFilter}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <BarChart className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className={`text-2xl sm:text-3xl font-bold ${statusConfig.accentColor} mb-2 tracking-tight`}
                  key={`title-${statusFilter}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {statusConfig.title}
                </motion.h1>
                {statusConfig.description && (
                  <motion.p 
                    className="text-base text-muted-foreground"
                    key={`desc-${statusFilter}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {statusConfig.description}
                  </motion.p>
                )}
              </div>
            </div>
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to Home</span>
              </Link>
              
              <Link
                href="/new"
                className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>New Job</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Download History Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DownloadHistorySection />
        </motion.div>

        {/* Job History Component */}
        <JobHistory
          jobs={jobs}
          loading={loading}
          onRefresh={handleRefresh}
          onViewJob={handleViewJob}
          onDownloadJob={handleDownloadJob}
          onDeleteJob={handleDeleteJob}
          onStatusFilterChange={handleStatusFilterChange}
        />
        </main>
      </div>
    </ProtectedRoute>
  );
}

function JobsPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navigation currentPath="/jobs" />
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageLoading />}>
      <JobsPageContent />
    </Suspense>
  );
}

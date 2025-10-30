'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BarChart, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { JobHistory } from '@/components/jobs/JobHistory';
import { Job } from '@/types';
import { fetchJobs, deleteJob as apiDeleteJob } from '@/lib/api';
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

  useEffect(() => {
    let isMounted = true;
    const loadJobs = async () => {
      setLoading(true);
      try {
        const realJobs = await fetchJobs();
        if (!isMounted) return;
        setJobs(realJobs);
      } catch (e) {
        if (!isMounted) return;
        // Quietly continue; redirect effect will handle empty state
        setJobs([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };
    loadJobs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Show empty state instead of redirecting when no jobs

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const realJobs = await fetchJobs();
      setJobs(realJobs);
    } catch {
      // Keep quiet; leave existing list
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
      await apiDeleteJob(jobId);
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

        {/* Empty state when no jobs */}
        {!loading && jobs.length === 0 ? (
          <motion.div
            className="text-center py-24 border border-dashed border-border rounded-2xl bg-muted/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#ff0000]/10 flex items-center justify-center">
              <Plus className="w-7 h-7 text-[#ff0000]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No jobs yet</h2>
            <p className="text-muted-foreground mb-6">Create your first dubbing job to get started.</p>
            <Link
              href="/new"
              className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Job</span>
            </Link>
          </motion.div>
        ) : (
          <JobHistory
            jobs={jobs}
            loading={loading}
            onRefresh={handleRefresh}
            onViewJob={handleViewJob}
            onDownloadJob={handleDownloadJob}
            onDeleteJob={handleDeleteJob}
            onStatusFilterChange={handleStatusFilterChange}
          />
        )}
        </main>
        
        {/* Creative Downloads Section */}
        <div className="mt-16 mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Download className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Download?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Access all your completed dubbing projects and manage your downloads in one place.
              </p>
              
              <Link 
                href="/downloads"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Go to Downloads
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
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

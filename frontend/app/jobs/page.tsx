'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { JobHistory } from '@/components/jobs/JobHistory';
import { Job } from '@/types';
import { useToastHelpers } from '@/components/ToastNotifications';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToastHelpers();

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
      } catch (error) {
        showError('Failed to load jobs', 'There was an error loading your jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [showError]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real app, would refetch from API
    } catch (error) {
      showError('Refresh failed', 'There was an error refreshing the jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    window.location.href = `/jobs/${jobId}`;
  };

  const handleDownloadJob = (jobId: string) => {
    // In real app, would trigger download
    console.log('Download job:', jobId);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      showError('Delete failed', 'There was an error deleting the job. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/jobs" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home Link */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Job History Component */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        }>
          <JobHistory
            jobs={jobs}
            loading={loading}
            onRefresh={handleRefresh}
            onViewJob={handleViewJob}
            onDownloadJob={handleDownloadJob}
            onDeleteJob={handleDeleteJob}
          />
        </Suspense>
      </main>
    </div>
  );
}
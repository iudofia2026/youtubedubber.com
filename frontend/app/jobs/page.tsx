'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { JobHistory } from '@/components/jobs/JobHistory';
import { Job } from '@/types';
import { useToastHelpers } from '@/components/ToastNotifications';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
  }, []); // Remove showError from dependencies to prevent infinite re-renders

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

        {/* Creative Header with Visual Distinction */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Animated Background Pattern */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000]/5 via-transparent to-[#ff0000]/5 rounded-2xl"></div>
            <motion.div
              className="absolute top-0 left-0 w-64 h-64 bg-[#ff0000]/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 50, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.5, 0.2],
                x: [0, -30, 0]
              }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
            
            <div className="relative z-10 p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <motion.h1 
                      className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      Your Jobs
                    </motion.h1>
                    <motion.p 
                      className="text-base text-muted-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      Manage and track your dubbing jobs
                    </motion.p>
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
            </div>
          </div>
        </motion.div>

        {/* Job History Component */}
        <JobHistory
          jobs={jobs}
          loading={loading}
          onRefresh={handleRefresh}
          onViewJob={handleViewJob}
          onDownloadJob={handleDownloadJob}
          onDeleteJob={handleDeleteJob}
        />
        </main>
      </div>
    </ProtectedRoute>
  );
}
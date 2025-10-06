'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobCard } from './JobCard';
import { JobFilters, JobStatus, SortOption } from './JobFilters';
import { EmptyState } from '@/components/LoadingStates';
import { Job } from '@/types';
import { useToastHelpers } from '@/components/ToastNotifications';

interface JobHistoryProps {
  jobs: Job[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewJob?: (jobId: string) => void;
  onDownloadJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
}

export function JobHistory({
  jobs,
  loading = false,
  onRefresh,
  onViewJob,
  onDownloadJob,
  onDeleteJob
}: JobHistoryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [isInitialized, setIsInitialized] = useState(false);
  const { error: showError } = useToastHelpers();

  // Initialize filters from URL parameters (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') as JobStatus;
    const search = urlParams.get('search');
    const sort = urlParams.get('sort') as SortOption;

    if (status && ['all', 'pending', 'processing', 'complete', 'error'].includes(status)) {
      setStatusFilter(status);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (sort && ['newest', 'oldest', 'status', 'duration'].includes(sort)) {
      setSortBy(sort);
    }
    
    setIsInitialized(true);
  }, []);

  // Filter and sort jobs
  useEffect(() => {
    if (!isInitialized) return;
    
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.id.toLowerCase().includes(query) ||
        job.targetLanguages.some(lang => lang.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'duration':
          return b.voiceTrackDuration - a.voiceTrackDuration;
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter, sortBy, isInitialized]);

  const updateURL = (newParams: { status?: JobStatus; search?: string; sort?: SortOption }) => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    
    if (newParams.status !== undefined) {
      if (newParams.status === 'all') {
        params.delete('status');
      } else {
        params.set('status', newParams.status);
      }
    }
    
    if (newParams.search !== undefined) {
      if (newParams.search === '') {
        params.delete('search');
      } else {
        params.set('search', newParams.search);
      }
    }
    
    if (newParams.sort !== undefined) {
      if (newParams.sort === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', newParams.sort);
      }
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/jobs${newURL}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateURL({ search: query });
  };

  const handleStatusChange = (status: JobStatus) => {
    setStatusFilter(status);
    updateURL({ status });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
    updateURL({ status: 'all', search: '', sort: 'newest' });
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await onDeleteJob?.(jobId);
      } catch (error) {
        showError('Delete failed', 'There was an error deleting the job. Please try again.');
      }
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: jobs.length,
      pending: jobs.filter(job => job.status === 'pending').length,
      processing: jobs.filter(job => job.status === 'processing').length,
      complete: jobs.filter(job => job.status === 'complete').length,
      error: jobs.filter(job => job.status === 'error').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading || !isInitialized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job History</h1>
          <Button
            variant="outline"
            disabled
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={() => window.location.href = '/new'}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Job</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <JobFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-16 h-16 text-gray-400" />}
          title={jobs.length === 0 ? "No jobs yet" : "No jobs match your filters"}
          description={
            jobs.length === 0 
              ? "Create your first dubbing job to get started"
              : "Try adjusting your search or filter criteria"
          }
          action={
            jobs.length === 0 ? {
              label: "Create New Job",
              onClick: () => window.location.href = '/new'
            } : {
              label: "Clear Filters",
              onClick: handleClearFilters
            }
          }
        />
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          layout
        >
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <JobCard
                  job={job}
                  onView={onViewJob}
                  onDownload={onDownloadJob}
                  onDelete={handleDeleteJob}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
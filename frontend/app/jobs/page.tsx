'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function JobsPage() {
  // Empty jobs list - in a real app, this would come from an API
  const mockJobs: any[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-[#ff0000]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600';
      case 'processing':
        return 'text-[#ff0000]';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/jobs" />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 tracking-tight">
                Your Jobs
              </h1>
              <p className="text-lg text-muted-foreground">
                Track the progress of your dubbing jobs
              </p>
            </div>
            <Link href="/new">
              <motion.button
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#ff0000] text-white hover:bg-[#cc0000] transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>New Job</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Jobs List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {mockJobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="bg-card/50 backdrop-blur-sm border border-border p-6 hover:border-[#ff0000]/50 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Job {job.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.languages.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {job.completedAt ? `Completed ${job.completedAt}` : `Started ${job.startedAt}`}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-mono text-foreground">{job.progress}%</span>
                </div>
                <div className="w-full bg-muted h-2 relative overflow-hidden">
                  <motion.div
                    className={`h-full ${job.status === 'complete' ? 'bg-green-500' : 'bg-[#ff0000]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${job.progress}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link href={`/jobs/${job.id}`}>
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-[#ff0000] hover:bg-[#ff0000]/10 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {mockJobs.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No jobs yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first dubbing job to get started
            </p>
            <Link href="/new">
              <motion.button
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#ff0000] text-white hover:bg-[#cc0000] transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Job</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { ProgressBar } from '@/components/ProgressBar';
import { Navigation } from '@/components/Navigation';
import { simulateJobProgress } from '@/lib/api';
import { JobStatus } from '@/types';

export default function JobStatusPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [jobStatus, setJobStatus] = useState<JobStatus>({
    id: jobId,
    status: 'uploading',
    progress: 0,
    message: 'Uploading files...',
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!jobId) {
      router.push('/');
      return;
    }

    // Start progress simulation
    const stopSimulation = simulateJobProgress(
      jobId,
      (status) => {
        setJobStatus(status);
        if (status.status === 'complete') {
          setIsComplete(true);
        }
      },
      () => {
        setIsComplete(true);
      }
    );

    return () => {
      stopSimulation();
    };
  }, [jobId, router]);

  const handleDownload = (type: 'voice' | 'background' | 'combined') => {
    // Mock download - in a real app, this would trigger actual file download
    console.log(`Downloading ${type} dub for job ${jobId}`);
    // You could implement actual download logic here
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
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Dubbing Job Status
              </h1>
              <p className="text-lg text-muted-foreground">
                Job ID: <span className="font-mono text-primary">{jobId}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isComplete ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Clock className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="mb-8"
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

        {/* Download Section - Only show when complete */}
        {isComplete && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Dubbing Job is Complete!
              </h2>
              <p className="text-muted-foreground">
                Download your dubbed audio files below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  type: 'voice' as const,
                  title: 'Voice Dub',
                  description: 'Download the dubbed voice track',
                  icon: Download,
                },
                {
                  type: 'background' as const,
                  title: 'Background Dub',
                  description: 'Download the dubbed background track',
                  icon: Download,
                },
                {
                  type: 'combined' as const,
                  title: 'Combined Audio',
                  description: 'Download the complete dubbed audio',
                  icon: Download,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.type}
                    onClick={() => handleDownload(item.type)}
                    className="p-6 border border-border hover:border-primary transition-colors duration-200 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary/80" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Job Details */}
        <motion.div
          className="mt-12 p-6 bg-muted/50 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Job Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job ID:</span>
              <span className="font-mono text-foreground">{jobId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium ${
                isComplete ? 'text-green-600' : 'text-primary'
              }`}>
                {isComplete ? 'Complete' : jobStatus.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress:</span>
              <span className="text-foreground">{jobStatus.progress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Step:</span>
              <span className="text-foreground">{jobStatus.message}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Link href="/new">
            <motion.button
              className="w-full sm:w-auto px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create New Job
            </motion.button>
          </Link>
          <Link href="/">
            <motion.button
              className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
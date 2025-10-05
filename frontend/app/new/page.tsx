'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { LanguageChecklist } from '@/components/LanguageChecklist';
import { Navigation } from '@/components/Navigation';
import { LANGUAGES } from '@/types';
import { submitDubbingJob } from '@/lib/api';

export default function NewJobPage() {
  const router = useRouter();
  const [voiceTrack, setVoiceTrack] = useState<File | null>(null);
  const [backgroundTrack, setBackgroundTrack] = useState<File | null>(null);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    voiceTrack?: string;
    targetLanguages?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!voiceTrack) {
      newErrors.voiceTrack = 'Voice track is required';
    }

    if (targetLanguages.length === 0) {
      newErrors.targetLanguages = 'Please select at least one target language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!voiceTrack) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const jobData = {
        voiceTrack,
        backgroundTrack: backgroundTrack || undefined,
        targetLanguages,
      };

      const result = await submitDubbingJob(jobData);
      router.push(`/jobs/${result.jobId}`);
    } catch (error) {
      setErrors({
        general: 'Failed to submit job. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/new" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Create New Dubbing Job
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your audio files and select the target languages for dubbing.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Voice Track Upload */}
          <div>
            <FileUpload
              label="Voice Track"
              required
              accept="audio/*"
              maxSize={100}
              onFileSelect={setVoiceTrack}
              error={errors.voiceTrack}
              value={voiceTrack}
            />
          </div>

          {/* Background Track Upload */}
          <div>
            <FileUpload
              label="Background Track (Optional)"
              accept="audio/*"
              maxSize={100}
              onFileSelect={setBackgroundTrack}
              value={backgroundTrack}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Optional background music or ambient audio to be dubbed along with the voice track.
            </p>
          </div>

          {/* Language Selection */}
          <div>
            <LanguageChecklist
              value={targetLanguages}
              onChange={setTargetLanguages}
              languages={LANGUAGES}
              error={errors.targetLanguages}
            />
          </div>

          {/* General Error */}
          {errors.general && (
            <motion.div
              className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>{errors.general}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`
                inline-flex items-center space-x-3 px-8 py-4 text-lg font-semibold transition-all duration-200
                ${isSubmitting
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
              `}
              whileHover={!isSubmitting ? { scale: 1.05 } : {}}
              whileTap={!isSubmitting ? { scale: 0.95 } : {}}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Submit Job</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* Help Section */}
        <motion.div
          className="mt-16 p-6 bg-muted/50 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upload Guidelines
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Voice Track:</strong> Upload your main audio content (speech, narration, etc.). 
                Supported formats: MP3, WAV, M4A, AAC. Maximum size: 100MB.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Background Track:</strong> Optional background music or ambient audio. 
                This will be dubbed along with the voice track.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <p>
                <strong>Processing Time:</strong> Most jobs complete within 5-15 minutes. 
                You'll be redirected to a status page where you can monitor progress.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
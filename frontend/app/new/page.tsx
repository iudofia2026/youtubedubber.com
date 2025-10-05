'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Music, Globe, Upload, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { LanguageChecklist } from '@/components/LanguageChecklist';
import { Navigation } from '@/components/Navigation';
import { LANGUAGES } from '@/types';
import { submitDubbingJob } from '@/lib/api';
import { areDurationsEqual, formatDurationDifference, formatDuration } from '@/lib/audio-utils';

export default function NewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceTrack, setVoiceTrack] = useState<File | null>(null);
  const [backgroundTrack, setBackgroundTrack] = useState<File | null>(null);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState<number | null>(null);
  const [backgroundDuration, setBackgroundDuration] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    voiceTrack?: string;
    targetLanguages?: string;
    durationMismatch?: string;
    general?: string;
  }>({});

  const steps = [
    { id: 1, title: 'Voice Track', description: 'Upload your voice-only audio file', icon: Mic },
    { id: 2, title: 'Background Track', description: 'Add background music (optional)', icon: Music },
    { id: 3, title: 'Target Languages', description: 'Select languages for dubbing', icon: Globe },
  ];

  const validateStep = useCallback((step: number) => {
    if (step === 1 && !voiceTrack) {
      return false;
    }

    if (step === 3 && targetLanguages.length === 0) {
      return false;
    }

    return true;
  }, [voiceTrack, targetLanguages]);

  const isStepValid = useMemo(() => {
    return validateStep(currentStep);
  }, [validateStep, currentStep]);

  const isFinalStepValid = useMemo(() => {
    if (!voiceTrack || targetLanguages.length === 0) {
      return false;
    }

    // Check duration mismatch if both tracks are present
    if (voiceTrack && backgroundTrack && voiceDuration && backgroundDuration) {
      if (!areDurationsEqual(voiceDuration, backgroundDuration)) {
        return false;
      }
    }

    return true;
  }, [voiceTrack, targetLanguages, backgroundTrack, voiceDuration, backgroundDuration]);

  const nextStep = useCallback(() => {
    if (isStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [isStepValid, currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!isFinalStepValid) {
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
  }, [isFinalStepValid, voiceTrack, backgroundTrack, targetLanguages, router]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/new" />
      
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
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Create New Dubbing Job
          </h1>
          <p className="text-lg text-muted-foreground">
            Follow these simple steps to create your multilingual dubbing job.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    className={`relative flex flex-col items-center space-y-2 ${
                      isActive ? 'scale-110' : ''
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#ff0000] border-[#ff0000] text-white'
                          : isActive
                          ? 'bg-[#ff0000] border-[#ff0000] text-white'
                          : 'bg-background border-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${
                        isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                  
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 ${
                      isCompleted ? 'bg-[#ff0000]' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-[500px] flex flex-col justify-center"
            >
              {/* Step 1: Voice Track Upload */}
              {currentStep === 1 && (
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-32 h-32 mx-auto bg-[#ff0000]/10 rounded-full flex items-center justify-center"
                  >
                    <Mic className="w-16 h-16 text-[#ff0000]" />
                  </motion.div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Upload Voice Track</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Upload your voice-only audio file. This will be the main content that gets dubbed into other languages.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <FileUpload
                      label="Voice Track"
                      required
                      accept="audio/*"
                      maxSize={100}
                      onFileSelect={setVoiceTrack}
                      onDurationChange={setVoiceDuration}
                      error={errors.voiceTrack}
                      value={voiceTrack}
                      duration={voiceDuration}
                      durationFormatted={voiceDuration ? formatDuration(voiceDuration) : undefined}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>🎤 Supported formats: MP3, WAV, M4A, AAC</p>
                    <p>📏 Maximum file size: 100MB</p>
                    <p>⏱️ Processing time: 5-15 minutes</p>
                  </div>
                </div>
              )}

              {/* Step 2: Background Track Upload */}
              {currentStep === 2 && (
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-32 h-32 mx-auto bg-[#ff0000]/10 rounded-full flex items-center justify-center"
                  >
                    <Music className="w-16 h-16 text-[#ff0000]" />
                  </motion.div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Background Track (Optional)</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Add background music or ambient audio that will be dubbed along with your voice track.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <FileUpload
                      label="Background Track (Optional)"
                      accept="audio/*"
                      maxSize={100}
                      onFileSelect={setBackgroundTrack}
                      onDurationChange={setBackgroundDuration}
                      value={backgroundTrack}
                      duration={backgroundDuration}
                      durationFormatted={backgroundDuration ? formatDuration(backgroundDuration) : undefined}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>🎵 This step is completely optional</p>
                    <p>⏱️ Must match voice track duration if provided</p>
                    <p>🎶 Background music will be dubbed too</p>
                  </div>

                  {/* Duration Comparison */}
                  {voiceTrack && backgroundTrack && voiceDuration && backgroundDuration && (
                    <motion.div
                      className="max-w-md mx-auto p-4 bg-muted/50 border border-border rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="text-sm font-medium mb-3">Track Duration Comparison</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Voice Track</p>
                          <p className="font-mono text-lg">{formatDuration(voiceDuration)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Background Track</p>
                          <p className="font-mono text-lg">{formatDuration(backgroundDuration)}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        {areDurationsEqual(voiceDuration, backgroundDuration) ? (
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            ✅ Tracks match perfectly
                          </p>
                        ) : (
                          <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                            ⚠️ Duration difference: {formatDurationDifference(voiceDuration, backgroundDuration)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Target Languages */}
              {currentStep === 3 && (
                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-32 h-32 mx-auto bg-[#ff0000]/10 rounded-full flex items-center justify-center"
                  >
                    <Globe className="w-16 h-16 text-[#ff0000]" />
                  </motion.div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">Select Target Languages*</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Choose the languages you want your content dubbed into. You can select multiple languages.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <LanguageChecklist
                      value={targetLanguages}
                      onChange={setTargetLanguages}
                      languages={LANGUAGES}
                      error={errors.targetLanguages}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>🌍 Select one or more languages</p>
                    <p>🎯 Each language will create a separate dubbed version</p>
                    <p>⚡ Processing time increases with more languages</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div
            className="flex justify-between mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
              whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 1 ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </motion.button>

            {currentStep < steps.length ? (
              <motion.button
                onClick={nextStep}
                disabled={!isStepValid}
                className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isStepValid
                    ? 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                whileHover={isStepValid ? { scale: 1.05 } : {}}
                whileTap={isStepValid ? { scale: 0.95 } : {}}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting || !isFinalStepValid}
                className={`inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || !isFinalStepValid
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
                }`}
                whileHover={!isSubmitting && isFinalStepValid ? { scale: 1.05 } : {}}
                whileTap={!isSubmitting && isFinalStepValid ? { scale: 0.95 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Submit Job</span>
                  </>
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Error Messages */}
          <AnimatePresence>
            {(errors.durationMismatch || errors.general) && (
              <motion.div
                className="mt-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {errors.durationMismatch && (
                  <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg">
                    <div className="w-5 h-5 text-yellow-600">⚠️</div>
                    <div>
                      <p className="font-medium">Duration Mismatch</p>
                      <p className="text-sm">{errors.durationMismatch}</p>
                    </div>
                  </div>
                )}

                {errors.general && (
                  <div className="flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                    <div className="w-5 h-5">❌</div>
                    <span>{errors.general}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
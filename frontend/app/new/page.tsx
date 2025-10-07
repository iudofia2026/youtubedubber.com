'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Music, Globe, Upload, CheckCircle, Play, Pause, Scissors, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { LanguageChecklist } from '@/components/LanguageChecklist';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { LANGUAGES } from '@/types';
import { submitDubbingJob } from '@/lib/api';
import { areDurationsEqual, formatDurationDifference, formatDuration } from '@/lib/audio-utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function NewJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
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
  
  // Refs for auto-scroll functionality
  const instructionsRef = useRef<HTMLDivElement>(null);
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false);
  
  // State for checking if user has past jobs
  const [hasPastJobs, setHasPastJobs] = useState<boolean | null>(null);
  const [isCheckingJobs, setIsCheckingJobs] = useState(true);

  const steps = [
    { id: 0, title: 'Audio Setup', description: 'Prepare your audio files', icon: Scissors },
    { id: 1, title: 'Voice Track', description: 'Upload your voice-only audio file', icon: Mic },
    { id: 2, title: 'Background Track', description: 'Add background music (optional)', icon: Music },
    { id: 3, title: 'Target Languages', description: 'Select languages for dubbing', icon: Globe },
  ];

  // Function to check if user has past jobs
  const checkPastJobs = useCallback(async () => {
    setIsCheckingJobs(true);
    try {
      // Simulate API call to check for past jobs
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - in real app, this would be an API call
      // For now, we'll use localStorage to simulate user state
      const hasJobs = localStorage.getItem('ytdubber_has_jobs') === 'true';
      setHasPastJobs(hasJobs);
      
      // If user has past jobs, start at step 1 (Voice Track)
      if (hasJobs) {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error checking past jobs:', error);
      // Default to showing instructions if there's an error
      setHasPastJobs(false);
    } finally {
      setIsCheckingJobs(false);
    }
  }, []);

  // Check for past jobs on component mount
  useEffect(() => {
    checkPastJobs();
  }, [checkPastJobs]);

  // Custom smooth scroll function with duration control
  const smoothScrollToElement = (element: HTMLElement, duration: number = 2000) => {
    const targetPosition = element.offsetTop - window.innerHeight / 2 + element.offsetHeight / 2;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function for smooth animation (ease-in-out)
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Auto-scroll to instructions after initial load (only for first-time users)
  useEffect(() => {
    if (currentStep === 0 && !hasAutoScrolled && instructionsRef.current && hasPastJobs === false) {
      const timer = setTimeout(() => {
        smoothScrollToElement(instructionsRef.current!, 3000); // 3 seconds duration
        setHasAutoScrolled(true);
      }, 2500); // Wait 2.5 seconds before scrolling

      return () => clearTimeout(timer);
    }
  }, [currentStep, hasAutoScrolled, hasPastJobs]);

  const validateStep = useCallback((step: number) => {
    if (step === 0) {
      return true; // Intro step is always valid
    }

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
    // For returning users, don't allow going back to step 0 (audio setup)
    const minStep = hasPastJobs ? 1 : 0;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, hasPastJobs]);

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
      
      // Mark that user now has jobs (for future visits)
      localStorage.setItem('ytdubber_has_jobs', 'true');
      
      const languagesParam = targetLanguages.join(',');
      router.push(`/jobs/${result.jobId}?languages=${languagesParam}`);
    } catch (error) {
      setErrors({
        general: 'Failed to submit job. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isFinalStepValid, voiceTrack, backgroundTrack, targetLanguages, router]);

  // Show loading state while checking for past jobs (after all hooks)
  if (isCheckingJobs) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/new" />
        <main className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/new" />
        
        <main className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Breadcrumbs items={breadcrumbConfigs.newJob} />
        </motion.div>

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Home</span>
            </Link>
            
            <Link
              href="/jobs"
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#ff0000] hover:text-white hover:bg-[#ff0000] border border-[#ff0000] rounded-lg transition-all duration-200 group"
            >
              <span>View Jobs</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>
          
        </motion.div>


        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-[300px] flex flex-col justify-start"
            >
              {/* Step 0: Audio Setup Introduction - Only for first-time users */}
              {currentStep === 0 && hasPastJobs === false && (
                <div className="space-y-8">
                  {/* Main Header */}
                  <motion.div
                    className="text-center max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full mb-6 shadow-lg"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Scissors className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight">
                      Prepare Your Audio Files
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      Before we can create multilingual dubs, you&apos;ll need to split your video&apos;s audio into two separate MP3 files
                    </p>
                    
                    {/* Auto-scroll indicator */}
                    <motion.div
                      className="mt-6 flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.5 }}
                    >
                      <motion.p
                        className="text-sm text-muted-foreground mb-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Detailed instructions below
                      </motion.p>
                      <motion.div
                        className="text-muted-foreground/60"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  </motion.div>


                  {/* Enhanced Instructions - Centerpiece */}
                  <motion.div
                    ref={instructionsRef}
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    {/* Main Container with Enhanced Styling */}
                    <div className="relative bg-gradient-to-br from-[#ff0000]/5 via-[#ff0000]/3 to-[#ff0000]/8 border-2 border-[#ff0000]/20 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                      {/* Decorative Background Elements */}
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#ff0000]/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#ff0000]/5 rounded-full blur-2xl" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#ff0000]/3 rounded-full blur-3xl" />
                      </div>
                      
                      {/* Header Section */}
                      <motion.div
                        className="text-center mb-8 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        <motion.div
                          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-2xl mb-4 shadow-lg"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Scissors className="w-8 h-8 text-white" />
                        </motion.div>
                        
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
                          How to Split Your Audio
                        </h3>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Follow these steps to prepare your audio files for multilingual dubbing
                        </p>
                      </motion.div>

                      {/* Enhanced Step Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Step 1 */}
                        <motion.div
                          className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#ff0000]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 1.0 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 10 }}
                            >
                              <span className="text-white font-bold text-lg">1</span>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#ff0000] transition-colors duration-300">
                                Import Your Video
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">
                                Use any audio editing software (Audacity, Adobe Audition, DaVinci Resolve, etc.) and import your video file
                              </p>
                            </div>
                          </div>
                          {/* Decorative line */}
                          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                          className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#ff0000]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 10 }}
                            >
                              <span className="text-white font-bold text-lg">2</span>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#ff0000] transition-colors duration-300">
                                Split the Audio
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">
                                Create two separate tracks: one with only voice, one with only background audio
                              </p>
                            </div>
                          </div>
                          {/* Decorative line */}
                          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                          className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#ff0000]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 10 }}
                            >
                              <span className="text-white font-bold text-lg">3</span>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#ff0000] transition-colors duration-300">
                                Export Voice Track
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">
                                Export the voice-only track as an MP3 file (clean speech, no background music)
                              </p>
                            </div>
                          </div>
                          {/* Decorative line */}
                          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>

                        {/* Step 4 */}
                        <motion.div
                          className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#ff0000]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 1.6 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 10 }}
                            >
                              <span className="text-white font-bold text-lg">4</span>
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#ff0000] transition-colors duration-300">
                                Export Background Track
                              </h4>
                              <p className="text-muted-foreground leading-relaxed">
                                Export the background track as an MP3 file with the same duration as the voice track
                              </p>
                            </div>
                          </div>
                          {/* Decorative line */}
                          <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                      </div>

                      {/* Important Note */}
                      <motion.div
                        className="mt-8 p-4 bg-[#ff0000]/10 border border-[#ff0000]/30 rounded-xl relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#ff0000] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">!</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground mb-1">Important</p>
                            <p className="text-sm text-muted-foreground">
                              Both audio files must have the exact same duration for proper synchronization during dubbing.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                </div>
              )}

              {/* Step 1: Voice Track Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Welcome back message for returning users */}
                  {hasPastJobs && (
                    <motion.div
                      className="max-w-2xl mx-auto mb-6 p-4 bg-[#ff0000]/10 border border-[#ff0000]/20 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-[#ff0000] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Welcome back!</p>
                          <p className="text-xs text-muted-foreground">
                            Since you&apos;ve created jobs before, we&apos;ll skip the audio preparation guide and go straight to uploading.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* Creative Horizontal Header with Icon Left */}
                  <motion.div
                    className="flex items-center justify-center space-x-6 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {/* Animated Icon Section */}
                    <motion.div
                      className="relative flex-shrink-0"
                      initial={{ scale: 0.8, opacity: 0, x: -20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Main icon container */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] flex items-center justify-center shadow-lg">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Mic className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Text Content with Creative Layout */}
                    <div className="flex-1 text-left space-y-2">
                      <motion.div
                        className="flex items-baseline space-x-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground">
                          Upload Voice Track
                        </h2>
                        
                        {/* Animated Sound Waves */}
                        <motion.div
                          className="relative flex items-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: 1,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-gradient-to-t from-[#ff0000] to-[#ff6666] rounded-full"
                                animate={{
                                  height: [4, 16, 8, 20, 6, 12, 4],
                                  opacity: [0.3, 1, 0.7, 1, 0.5, 0.9, 0.3]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                  ease: "easeInOut"
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="h-1 w-8 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 1.2 }}
                        />
                      </motion.div>
                      
                      <motion.p 
                        className="text-base text-muted-foreground leading-relaxed max-w-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        Upload your voice-only audio file first
                      </motion.p>
                      
                    </div>
                  </motion.div>

                  {/* File Upload Component */}
                  <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
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
                  </motion.div>

                </div>
              )}

              {/* Step 2: Background Track Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Creative Horizontal Header with Music Icon Left */}
                  <motion.div
                    className="flex items-center justify-center space-x-6 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {/* Animated Music Icon Section */}
                    <motion.div
                      className="relative flex-shrink-0"
                      initial={{ scale: 0.8, opacity: 0, x: -20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Main icon container */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] flex items-center justify-center shadow-lg">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Music className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Text Content with Creative Layout */}
                    <div className="flex-1 text-left space-y-2">
                      <motion.div
                        className="flex items-baseline space-x-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground">
                          Background Track
                        </h2>
                        
                        {/* Animated Music Notes */}
                        <motion.div
                          className="relative flex items-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: 1,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="text-[#ff0000] text-lg"
                                animate={{
                                  y: [0, -3, 0],
                                  rotate: [0, 5, 0]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.3,
                                  ease: "easeInOut"
                                }}
                              >
                                ♪
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="h-1 w-8 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 1.2 }}
                        />
                      </motion.div>
                      
                      <motion.p 
                        className="text-base text-muted-foreground leading-relaxed max-w-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        Add background music or ambient audio (optional)
                      </motion.p>
                      
                    </div>
                  </motion.div>

                  {/* File Upload Component */}
                  <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
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
                  </motion.div>

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
                <div className="space-y-6">
                  {/* Creative Horizontal Header with Globe Icon Left */}
                  <motion.div
                    className="flex items-center justify-center space-x-6 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {/* Animated Globe Icon Section */}
                    <motion.div
                      className="relative flex-shrink-0"
                      initial={{ scale: 0.8, opacity: 0, x: -20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {/* Main icon container */}
                      <div className="relative w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] flex items-center justify-center shadow-lg">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Globe className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>
                    
                    {/* Text Content with Creative Layout */}
                    <div className="flex-1 text-left space-y-2">
                      <motion.div
                        className="flex items-baseline space-x-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h2 className="text-2xl font-bold text-foreground">
                          Target Languages
                        </h2>
                        
                        {/* Animated Language Flags */}
                        <motion.div
                          className="relative flex items-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: 1,
                            type: "spring",
                            stiffness: 200,
                            damping: 15
                          }}
                        >
                          <div className="relative flex items-center justify-center w-8 h-8">
                            {/* Central Node */}
                            <motion.div
                              className="w-2 h-2 bg-[#ff0000] rounded-full"
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.8, 1, 0.8]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            
                            {/* Orbiting Language Dots */}
                            {[0, 1, 2, 3, 4].map((i) => (
                              <motion.div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-[#ff0000] to-[#ff6666] rounded-full"
                                style={{
                                  transformOrigin: '0 0',
                                  left: '12px',
                                  top: '12px'
                                }}
                                animate={{
                                  rotate: [0, 360],
                                  scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  delay: i * 0.8,
                                  ease: "linear"
                                }}
                                initial={{
                                  x: Math.cos(i * (2 * Math.PI / 5)) * 10,
                                  y: Math.sin(i * (2 * Math.PI / 5)) * 10
                                }}
                              />
                            ))}
                            
                            {/* Connecting Lines */}
                            <motion.div
                              className="absolute inset-0 w-6 h-6 border border-[#ff0000]/30 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                            
                            {/* Pulsing Ring */}
                            <motion.div
                              className="absolute inset-0 w-6 h-6 border border-[#ff0000]/20 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0, 0.3]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div
                          className="h-1 w-8 bg-gradient-to-r from-[#ff0000] to-transparent rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 1.2 }}
                        />
                      </motion.div>
                      
                      <motion.p 
                        className="text-base text-muted-foreground leading-relaxed max-w-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        Select languages for multilingual dubbing
                      </motion.p>
                      
                    </div>
                  </motion.div>

                  {/* Language Selection Component */}
                  <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <LanguageChecklist
                      value={targetLanguages}
                      onChange={setTargetLanguages}
                      languages={LANGUAGES}
                      error={errors.targetLanguages}
                    />
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Progress Steps */}
          <motion.div
            className="mt-8 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center space-x-8">
              {steps
                .filter(step => hasPastJobs ? step.id !== 0 : true) // Hide step 0 for returning users
                .map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const displayIndex = hasPastJobs ? index + 1 : index; // Adjust numbering for returning users
                
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
                          {hasPastJobs && step.id === 1 ? 'Step 1: ' : ''}{step.title}
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

          {/* Navigation Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between mt-8 gap-3 sm:gap-0 mobile-button-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 0}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (currentStep > 0) prevStep();
              }}
              className={`inline-flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                currentStep === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
              whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </motion.button>

            {currentStep < steps.length ? (
              <motion.button
                onClick={nextStep}
                disabled={!isStepValid}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (isStepValid) nextStep();
                }}
                className={`inline-flex items-center justify-center space-x-2 px-8 py-4 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
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
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (!isSubmitting && isFinalStepValid) handleSubmit();
                }}
                className={`inline-flex items-center justify-center space-x-2 px-8 py-4 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
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
    </ProtectedRoute>
  );
}
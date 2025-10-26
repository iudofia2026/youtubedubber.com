'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Music, Globe, Upload, CheckCircle, Scissors, FileAudio, Zap, Download, Star, X } from 'lucide-react';
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
  
  // Refs for instructions
  const instructionsRef = useRef<HTMLDivElement>(null);
  
  
  // State for showing How It Works modal
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // State for banner dismissal
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showPullTab, setShowPullTab] = useState(false);
  
  // Refs for accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Handle banner dismissal and pull tab visibility
  useEffect(() => {
    if (bannerDismissed) {
      // Show pull tab after a short delay
      const timer = setTimeout(() => {
        setShowPullTab(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowPullTab(false);
    }
  }, [bannerDismissed]);

  // Handle banner interactions
  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const handleRestoreBanner = useCallback(() => {
    setBannerDismissed(false);
    setShowPullTab(false);
  }, []);

  // Handle file removal with proper state reset
  const handleVoiceTrackChange = useCallback((file: File | null) => {
    setVoiceTrack(file);
    if (!file) {
      setVoiceDuration(null);
    }
  }, []);

  const handleBackgroundTrackChange = useCallback((file: File | null) => {
    setBackgroundTrack(file);
    if (!file) {
      setBackgroundDuration(null);
    }
  }, []);

  const steps = [
    { id: 1, title: 'Voice', description: 'Upload audio', icon: Mic },
    { id: 2, title: 'Background', description: 'Add music', icon: Music },
    { id: 3, title: 'Languages', description: 'Select targets', icon: Globe },
    { id: 4, title: 'Launch', description: 'Start dubbing', icon: Upload },
  ];

  // How it works steps content
  const howItWorksSteps = [
    {
      number: '01',
      title: 'Prepare Your Audio',
      description: 'Split your video audio into separate voice and background tracks for optimal dubbing quality.',
      icon: FileAudio,
      details: [
        'Import your video into any video editor',
        'Export voice track (speech only, no music)',
        'Export background track (music, SFX, ambient)',
        'Or upload MP4 video directly (we\'ll extract audio)',
        'Ensure both tracks are the same duration'
      ],
      tips: [
        'Use high-quality audio (48kHz/24-bit recommended)',
        'Remove background noise from voice track',
        'Keep background music at consistent levels'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      number: '02',
      title: 'Upload Your Files',
      description: 'Upload your prepared audio tracks and select your target languages for dubbing.',
      icon: Upload,
      details: [
        'Upload voice track (required)',
        'Upload background track (optional)',
        'Select target languages (1-12+ languages)',
        'Review file details and confirm'
      ],
      tips: [
        'Supported formats: MP3, WAV, M4A, MP4',
        'Maximum file size: 100MB per track',
        'Processing time: 2-5 minutes per language'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '03',
      title: 'AI Processing',
      description: 'Our advanced AI analyzes your voice and generates natural-sounding dubs in your chosen languages.',
      icon: Zap,
      details: [
        'Speech-to-text conversion',
        'Translation to target languages',
        'AI voice generation and cloning',
        'Audio mixing and synchronization'
      ],
      tips: [
        'Processing happens in the cloud',
        'Real-time progress tracking',
        'Quality optimization for each language'
      ],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      number: '04',
      title: 'Download & Use',
      description: 'Download your completed dubs and integrate them into your content for maximum impact.',
      icon: Download,
      details: [
        'Download voice-only tracks',
        'Download full-mix tracks',
        'Get subtitle files (SRT/VTT)',
        'Files available for 48 hours'
      ],
      tips: [
        'Test audio quality before publishing',
        'Sync with your video timeline',
        'Keep backups of your files'
      ],
      color: 'from-green-500 to-emerald-500'
    }
  ];


  // Handle modal keyboard events and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showHowItWorks) return;
      
      if (event.key === 'Escape') {
        setShowHowItWorks(false);
        openButtonRef.current?.focus();
      }
    };

    if (showHowItWorks) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHowItWorks]);

  // Handle modal open
  const handleOpenModal = useCallback(() => {
    setShowHowItWorks(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setShowHowItWorks(false);
    openButtonRef.current?.focus();
  }, []);


  const validateStep = useCallback((step: number) => {
    if (step === 1 && !voiceTrack) {
      return false;
    }

    if (step === 3 && targetLanguages.length === 0) {
      return false;
    }

    if (step === 4) {
      // Check final step validity inline to avoid circular dependency
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
    }

    return true;
  }, [voiceTrack, targetLanguages, backgroundTrack, voiceDuration, backgroundDuration]);

  const isStepValid = useMemo(() => {
    return validateStep(currentStep);
  }, [validateStep, currentStep]);

  const isFinalStepValid = useMemo(() => {
    return validateStep(4); // Use the same validation logic for step 4
  }, [validateStep]);

  const nextStep = useCallback(() => {
    if (isStepValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }, [isStepValid, currentStep]);

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

        {/* Prominent How It Works Banner - Moved to Top */}
        <AnimatePresence>
          {!bannerDismissed && (
            <motion.div
              className="relative mb-8 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                x: "100%",
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            >
          {/* Static Background - More Performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000] via-[#ff3333] to-[#ff0000] opacity-90" />
          
          {/* Subtle Pattern Overlay - Reduced Animation */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            animate={{
              x: [0, 30, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Main Content */}
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Minimal Animated Icon - Reduced Animation */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
                
                {/* Text Content */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    New to AI Dubbing?
                  </h3>
                  <p className="text-white/90 text-sm">
                    Learn how our 4-step process works in under 2 minutes
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* CTA Button - Lightweight */}
                <motion.button
                  ref={openButtonRef}
                  onClick={handleOpenModal}
                  className="group relative px-6 py-3 bg-white text-[#ff0000] font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
                  whileHover={{
                    scale: 1.01
                  }}
                  whileTap={{ scale: 0.99 }}
                  aria-label="Learn how the dubbing process works"
                  aria-expanded={showHowItWorks}
                  aria-haspopup="dialog"
                >
                  <div className="flex items-center space-x-2">
                    <span>Get Started Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
                
                {/* Dismiss Button - Lightweight */}
                <motion.button
                  onClick={handleDismissBanner}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Dismiss banner"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pull-back Tab */}
        <AnimatePresence>
          {showPullTab && (
            <motion.div
              className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.button
                onClick={handleRestoreBanner}
                className="bg-[#ff0000] text-white px-4 py-3 rounded-l-lg shadow-lg hover:bg-[#cc0000] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Restore banner"
              >
                <div className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Restore Guide</span>
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

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

              {/* Step 1: Voice Track Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
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
                          Voice Track
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
                        Upload voice-only audio
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
                      accept="audio/*,video/mp4"
                      maxSize={100}
                      onFileSelect={handleVoiceTrackChange}
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
                          Background
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
                        Add background music (optional)
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
                      accept="audio/*,video/mp4"
                      maxSize={100}
                      onFileSelect={handleBackgroundTrackChange}
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
                          Languages
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
                        Select target languages
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

              {/* Step 4: Launch Job */}
              {currentStep === 4 && (
                <div className="space-y-8">

                  {/* Giant Minimalist Submit Button */}
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.6,
                      type: "spring",
                      stiffness: 120,
                      damping: 20
                    }}
                  >
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isFinalStepValid}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        if (!isSubmitting && isFinalStepValid) {
                          handleSubmit();
                          if (navigator.vibrate) {
                            navigator.vibrate(50);
                          }
                        }
                      }}
                      className={`relative group overflow-hidden transition-all duration-300 touch-manipulation ${
                        isSubmitting || !isFinalStepValid
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        width: '480px',
                        height: '80px'
                      }}
                      whileHover={!isSubmitting && isFinalStepValid ? { 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      } : {}}
                      whileTap={!isSubmitting && isFinalStepValid ? { 
                        scale: 0.98,
                        transition: { duration: 0.1 }
                      } : {}}
                    >
                      {/* Clean Background */}
                      <motion.div
                        className="absolute inset-0 bg-[#dc2626]"
                        animate={{
                          backgroundColor: [
                            '#dc2626',
                            '#ef4444',
                            '#dc2626'
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Sharp Border */}
                      <motion.div
                        className="absolute inset-0 border-2 border-white/60"
                        animate={{
                          borderColor: [
                            'rgba(255, 255, 255, 0.6)',
                            'rgba(255, 255, 255, 0.9)',
                            'rgba(255, 255, 255, 0.6)'
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      {/* Subtle Light Sweep */}
                      {!isSubmitting && isFinalStepValid && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: 1
                          }}
                        />
                      )}

                      {/* Button Content */}
                      <div className="relative z-10 flex items-center justify-center h-full px-8">
                        {isSubmitting ? (
                          <div className="flex items-center space-x-6">
                            <motion.div 
                              className="w-8 h-8 border-2 border-white border-t-transparent"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-2xl font-bold text-white tracking-wide">PROCESSING...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-6">
                            {/* Clean Icon */}
                            <motion.div
                              className="w-10 h-10 bg-white/20 flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Zap className="w-5 h-5 text-white" />
                            </motion.div>
                            
                            <div className="text-center">
                              <motion.div
                                className="text-3xl font-black text-white tracking-wider"
                                animate={{
                                  textShadow: [
                                    '0 0 0px rgba(255,255,255,0)',
                                    '0 0 15px rgba(255,255,255,0.3)',
                                    '0 0 0px rgba(255,255,255,0)'
                                  ]
                                }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                LAUNCH
                              </motion.div>
                              <motion.div
                                className="text-sm font-medium text-white/90 tracking-wide mt-1"
                                animate={{
                                  opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                START DUBBING
                              </motion.div>
                            </div>

                            {/* Clean Arrow */}
                            <motion.div
                              className="w-10 h-10 bg-white/20 flex items-center justify-center"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                x: [0, 2, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                            >
                              <ArrowRight className="w-5 h-5 text-white" />
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Minimal Pulse Effect */}
                      {!isSubmitting && isFinalStepValid && (
                        <motion.div
                          className="absolute inset-0 border border-white/30"
                          animate={{
                            scale: [1, 1.01, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Minimal Status Indicator */}
                  {isSubmitting && (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        Initializing dubbing process...
                      </p>
                      <motion.div
                        className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
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
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                // const displayIndex = hasPastJobs ? index + 1 : index; // Adjust numbering for returning users
                
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


          {/* Navigation Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between mt-8 gap-3 sm:gap-0 mobile-button-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={prevStep}
              disabled={currentStep === 1}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (currentStep > 1) {
                  prevStep();
                  // Haptic feedback
                  if (navigator.vibrate) {
                    navigator.vibrate(30);
                  }
                }
              }}
              className={`inline-flex items-center justify-center space-x-2 px-6 py-4 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
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

            {currentStep < 4 && (
              <motion.button
                onClick={nextStep}
                disabled={!isStepValid}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (isStepValid) {
                    nextStep();
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                  }
                }}
                className={`inline-flex items-center justify-center space-x-2 px-8 py-4 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
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

        {/* How It Works Modal */}
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <motion.div
                ref={modalRef}
                className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center shadow-lg"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Scissors className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 id="modal-title" className="text-2xl font-bold text-foreground">
                          How It Works
                        </h2>
                        <p id="modal-description" className="text-muted-foreground">
                          Learn how our AI-powered platform transforms your content
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      ref={closeButtonRef}
                      onClick={handleCloseModal}
                      className="w-10 h-10 rounded-full bg-muted hover:bg-destructive/10 flex items-center justify-center transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close How It Works modal"
                    >
                      <X className="w-5 h-5 group-hover:text-destructive transition-colors duration-200" />
                    </motion.button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                  <div className="space-y-12">
                    {howItWorksSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isEven = index % 2 === 0;
                      
                      return (
                        <motion.div
                          key={step.number}
                          className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        >
                          {/* Content */}
                          <div className="flex-1">
                            <motion.div
                              className="flex items-center space-x-4 mb-6"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                            >
                              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} flex items-center justify-center rounded-lg shadow-lg`}>
                                <Icon className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#ff0000] mb-1">Step {step.number}</div>
                                <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                              </div>
                            </motion.div>
                            
                            <motion.p
                              className="text-lg text-muted-foreground mb-8 font-light leading-relaxed"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                            >
                              {step.description}
                            </motion.p>
                            
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4">What you&apos;ll do:</h4>
                                <ul className="space-y-3">
                                  {step.details.map((detail, detailIndex) => (
                                    <motion.li
                                      key={detailIndex}
                                      className="flex items-start space-x-3"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.6, delay: index * 0.1 + 0.4 + detailIndex * 0.1 }}
                                    >
                                      <CheckCircle className="w-5 h-5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                                      <span className="text-muted-foreground">{detail}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-lg font-semibold text-foreground mb-4">Pro tips:</h4>
                                <ul className="space-y-2">
                                  {step.tips.map((tip, tipIndex) => (
                                    <motion.li
                                      key={tipIndex}
                                      className="flex items-start space-x-3"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.6, delay: index * 0.1 + 0.5 + tipIndex * 0.1 }}
                                    >
                                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-1" />
                                      <span className="text-sm text-muted-foreground">{tip}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          {/* Visual */}
                          <div className="flex-1 flex justify-center">
                            <motion.div
                              className={`w-80 h-80 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Icon className="w-32 h-32 text-white/80" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-white font-bold text-sm">{step.number}</span>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* CTA Section */}
                  <motion.div
                    className="max-w-4xl mx-auto text-center mt-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <div className="bg-gradient-to-r from-[#ff0000]/10 to-[#ff0000]/5 border border-[#ff0000]/20 p-8 rounded-lg">
                      <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
                        Ready to Get Started?
                      </h3>
                      
                      <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto font-light leading-relaxed">
                        Now that you know how it works, let&apos;s create your first multilingual dub!
                      </p>
                      
                      <motion.button
                        onClick={handleCloseModal}
                        className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Upload className="w-5 h-5" />
                        <span>Get Started</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}

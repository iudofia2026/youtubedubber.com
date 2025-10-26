'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mic, Music, Globe, Upload, CheckCircle, Scissors, FileAudio, Zap, Download, Star, X, Power, Clock } from 'lucide-react';
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
  const [bannerAnimationComplete, setBannerAnimationComplete] = useState(false);
  const [showPullTab, setShowPullTab] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Refs for accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);


  // Handle banner dismissal and pull tab visibility
  useEffect(() => {
    if (bannerDismissed) {
      // Show pull tab after a short delay
      const pullTabTimer = setTimeout(() => {
        setShowPullTab(true);
        setHasUserInteracted(true);
      }, 1000);
      
      return () => clearTimeout(pullTabTimer);
    } else {
      setBannerAnimationComplete(false);
      // Keep pull tab visible if user has interacted with it
      if (!hasUserInteracted) {
        setShowPullTab(false);
      }
    }
  }, [bannerDismissed, hasUserInteracted]);

  // Handle banner interactions
  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const handleRestoreBanner = useCallback(() => {
    setBannerDismissed(false);
    setBannerAnimationComplete(false);
    // Keep the restore button visible after restoring banner
    // Don't hide the pull tab - let it stay for easy toggling
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
              initial={{ opacity: 0, scale: 0.95, maxHeight: 0, marginBottom: 0 }}
              animate={{ opacity: 1, scale: 1, maxHeight: 200, marginBottom: 32 }}
              exit={{ 
                opacity: 0, 
                maxHeight: 0,
                marginBottom: 0,
                scale: 0.95,
                transition: { 
                  duration: 0.6, 
                  ease: "easeInOut",
                  onComplete: () => setBannerAnimationComplete(true)
                }
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


        {/* Step Content */}
        <motion.div 
          className="max-w-6xl mx-auto"
          layout
          transition={{ duration: 0.6, ease: "easeInOut" }}
          animate={{
            y: bannerAnimationComplete ? -20 : 0,
            transition: { 
              duration: 0.6, 
              ease: "easeInOut",
              delay: bannerAnimationComplete ? 0.1 : 0 // Small delay to ensure banner is completely gone
            }
          }}
        >
          {/* Guide Toggle Button - Positioned in content area */}
          <div className="flex justify-end mb-6">
            <div className="w-12 h-20">
              <AnimatePresence>
                {showPullTab && (
                  <motion.button
                    onClick={bannerDismissed ? handleRestoreBanner : handleDismissBanner}
                    className={`group relative w-12 h-20 rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50 flex flex-col items-center justify-center ${
                      bannerDismissed 
                        ? 'bg-[#ff0000] text-white hover:bg-[#cc0000]' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    whileHover={{ 
                      scale: 1.05
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={bannerDismissed ? "Restore guide banner" : "Dismiss guide banner"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* I/O Icon */}
                    <motion.div
                      className="w-6 h-6 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: bannerDismissed ? [0, 5, -5, 0] : [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Power className="w-5 h-5" />
                    </motion.div>
                    
                    {/* Text Label */}
                    <motion.div
                      className="mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="text-xs font-medium tracking-wider">
                        {bannerDismissed ? 'GUIDE' : 'HIDE'}
                      </span>
                    </motion.div>
                    
                    {/* Subtle Pulse Effect */}
                    <motion.div
                      className="absolute inset-0 border border-white/30 rounded-lg"
                      animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    
                    {/* Hover Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
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

              {/* Step 4: Job Summary & Launch */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  {/* Enhanced Job Summary */}
                  <motion.div
                    className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">Ready to Launch</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center space-x-3">
                            <Mic className="w-5 h-5 text-[#ff0000]" />
                            <span className="font-medium text-foreground">Voice Track</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-mono">{voiceTrack?.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-[#ff0000]" />
                            <span className="font-medium text-foreground">Duration</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-mono">
                            {voiceDuration ? formatDuration(voiceDuration) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-[#ff0000]" />
                            <span className="font-medium text-foreground">Languages</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            {targetLanguages.length} selected
                          </span>
                        </div>
                        
                        {backgroundTrack && (
                          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center space-x-3">
                              <Music className="w-5 h-5 text-[#ff0000]" />
                              <span className="font-medium text-foreground">Background</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">{backgroundTrack.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Selected Languages Display */}
                    <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600">
                      <h4 className="font-medium text-foreground mb-3">Selected Languages:</h4>
                      <div className="flex flex-wrap gap-2">
                        {targetLanguages.map((lang) => {
                          const language = LANGUAGES.find(l => l.code === lang);
                          return (
                            <span
                              key={lang}
                              className="inline-flex items-center space-x-2 px-3 py-1 bg-[#ff0000]/10 text-[#ff0000] rounded-full text-sm font-medium"
                            >
                              <span>{language?.flag}</span>
                              <span>{language?.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Message */}
                  {isSubmitting && (
                    <motion.div
                      className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-center space-x-3">
                        <motion.div
                          className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-blue-800 dark:text-blue-200 font-medium">
                          Processing your dubbing job...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

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


          {/* Enhanced Navigation Buttons - Sticky and Professional */}
          <motion.div
            className="sticky top-4 z-40 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {/* Previous Button */}
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
                    className={`group relative inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 touch-manipulation min-h-[52px] min-w-[140px] ${
                      currentStep === 1
                        ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-muted/30'
                        : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-200 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-300 dark:border-slate-600 shadow-md hover:shadow-lg'
                    }`}
                    whileHover={currentStep > 1 ? { 
                      scale: 1.02,
                      y: -2,
                      transition: { duration: 0.2 }
                    } : {}}
                    whileTap={currentStep > 1 ? { 
                      scale: 0.98,
                      y: 0,
                      transition: { duration: 0.1 }
                    } : {}}
                  >
                    <motion.div
                      className="flex items-center space-x-2"
                      animate={currentStep > 1 ? {
                        x: [-2, 0, -2]
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      <span className="text-sm font-medium">Previous</span>
                    </motion.div>
                    
                    {/* Subtle glow effect for enabled state */}
                    {currentStep > 1 && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={false}
                      />
                    )}
                  </motion.button>

                  {/* Step Indicator */}
                  <div className="flex items-center space-x-2 px-4 py-2 bg-muted/30 rounded-full">
                    <span className="text-sm font-medium text-muted-foreground">
                      Step {currentStep} of 4
                    </span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((step) => (
                        <motion.div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            step <= currentStep
                              ? 'bg-[#ff0000]'
                              : 'bg-muted-foreground/30'
                          }`}
                          animate={step === currentStep ? {
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Next Button */}
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
                      className={`group relative inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 touch-manipulation min-h-[52px] min-w-[140px] ${
                        isStepValid
                          ? 'bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white hover:from-[#cc0000] hover:to-[#aa0000] shadow-lg hover:shadow-xl'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-muted/30'
                      }`}
                      whileHover={isStepValid ? { 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      } : {}}
                      whileTap={isStepValid ? { 
                        scale: 0.98,
                        y: 0,
                        transition: { duration: 0.1 }
                      } : {}}
                    >
                      <motion.div
                        className="flex items-center space-x-2"
                        animate={isStepValid ? {
                          x: [0, 2, 0]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <span className="text-sm font-medium">Next</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                      
                      {/* Animated background effect for enabled state */}
                      {isStepValid && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        />
                      )}
                      
                      {/* Subtle pulse effect */}
                      {isStepValid && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-white/30"
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.button>
                  )}

                  {/* Launch Button for Step 4 */}
                  {currentStep === 4 && (
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isFinalStepValid}
                      className={`group relative inline-flex items-center justify-center space-x-3 px-12 py-4 rounded-xl font-bold transition-all duration-300 touch-manipulation min-h-[52px] min-w-[180px] ${
                        isSubmitting || !isFinalStepValid
                          ? 'bg-muted/50 text-muted-foreground cursor-not-allowed border border-muted/30'
                          : 'bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white hover:from-[#cc0000] hover:to-[#aa0000] shadow-xl hover:shadow-2xl'
                      }`}
                      whileHover={!isSubmitting && isFinalStepValid ? { 
                        scale: 1.05,
                        y: -3,
                        transition: { duration: 0.2 }
                      } : {}}
                      whileTap={!isSubmitting && isFinalStepValid ? { 
                        scale: 0.95,
                        y: 0,
                        transition: { duration: 0.1 }
                      } : {}}
                    >
                      <motion.div
                        className="flex items-center space-x-2"
                        animate={!isSubmitting && isFinalStepValid ? {
                          scale: [1, 1.05, 1]
                        } : {}}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-sm font-medium">Launching...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span className="text-sm font-medium">LAUNCH</span>
                          </>
                        )}
                      </motion.div>
                      
                      {/* Enhanced glow effect for launch button */}
                      {!isSubmitting && isFinalStepValid && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/30 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={false}
                        />
                      )}
                      
                      {/* Pulsing ring effect */}
                      {!isSubmitting && isFinalStepValid && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-white/40"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.6, 1, 0.6]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
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
        </main>

        {/* How It Works Modal */}
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              {/* Enhanced backdrop with animated gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff0000]/10 via-transparent to-[#ff0000]/5 animate-pulse-slow" />
              <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-[#ff0000]/5 to-transparent animate-float-slow" />
              
              <motion.div
                ref={modalRef}
                className="relative w-full max-w-7xl max-h-[95vh] bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                initial={{ scale: 0.85, opacity: 0, y: 60, rotateX: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 60, rotateX: 15 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 200,
                  mass: 0.8
                }}
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
                style={{
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                }}
              >
                {/* Enhanced Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-background/98 via-background/95 to-background/98 backdrop-blur-xl border-b border-white/10 p-6">
                  {/* Shimmer effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="relative w-14 h-14 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-2xl flex items-center justify-center shadow-2xl group"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, 5, -5, 0],
                          transition: { duration: 0.6 }
                        }}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-2xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                        <Scissors className="w-7 h-7 text-white relative z-10" />
                        
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                      </motion.div>
                      
                      <div>
                        <motion.h2 
                          id="modal-title" 
                          className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          How It Works
                        </motion.h2>
                        <motion.p 
                          id="modal-description" 
                          className="text-muted-foreground text-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          Learn how our AI-powered platform transforms your content
                        </motion.p>
                      </div>
                    </div>
                    
                    <motion.button
                      ref={closeButtonRef}
                      onClick={handleCloseModal}
                      className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-destructive/20 hover:to-destructive/10 flex items-center justify-center transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2 backdrop-blur-sm border border-white/10"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 90,
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close How It Works modal"
                    >
                      <X className="w-6 h-6 group-hover:text-destructive transition-colors duration-300" />
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Modal Content with Parallax */}
                <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-8 relative">
                  {/* Parallax background elements */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-[#ff0000]/5 to-transparent rounded-full blur-xl animate-float-slow" />
                    <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-[#ff0000]/3 to-transparent rounded-full blur-lg animate-pulse-slow" />
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-transparent to-[#ff0000]/4 rounded-full blur-md animate-float-slow" />
                  </div>
                  
                  <div className="relative space-y-16">
                    {howItWorksSteps.map((step, index) => {
                      const Icon = step.icon;
                      const isEven = index % 2 === 0;
                      
                      return (
                        <motion.div
                          key={step.number}
                          className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 group`}
                          initial={{ opacity: 0, y: 50, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.8, 
                            delay: index * 0.15,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.3 }
                          }}
                        >
                          {/* Enhanced Content */}
                          <motion.div 
                            className="flex-1 relative group"
                            whileHover={{ x: isEven ? 10 : -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-2xl transition-opacity duration-500" />
                            
                            <motion.div
                              className="flex items-center space-x-6 mb-8 relative z-10"
                              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                            >
                              <motion.div 
                                className={`relative w-20 h-20 bg-gradient-to-br ${step.color} flex items-center justify-center rounded-2xl shadow-2xl group/icon`}
                                whileHover={{ 
                                  scale: 1.1,
                                  rotate: [0, 5, -5, 0],
                                  transition: { duration: 0.6 }
                                }}
                                animate={{
                                  boxShadow: [
                                    "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                    "0 20px 40px -5px rgba(0, 0, 0, 0.15)",
                                    "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                  ]
                                }}
                                transition={{
                                  boxShadow: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }
                                }}
                              >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-md opacity-50 group-hover/icon:opacity-75 transition-opacity duration-300`} />
                                
                                <Icon className="w-10 h-10 text-white relative z-10" />
                                
                                {/* Shimmer overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl opacity-0 group-hover/icon:opacity-100 group-hover/icon:animate-shimmer transition-opacity duration-300" />
                                
                                {/* Step number badge */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-xs font-bold text-[#ff0000]">{step.number}</span>
                                </div>
                              </motion.div>
                              
                              <div>
                                <motion.div 
                                  className="text-sm font-semibold text-[#ff0000] mb-2 tracking-wide uppercase"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.15 + 0.4 }}
                                >
                                  Step {step.number}
                                </motion.div>
                                <motion.h3 
                                  className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.15 + 0.5 }}
                                >
                                  {step.title}
                                </motion.h3>
                              </div>
                            </motion.div>
                            
                            <motion.p
                              className="text-xl text-muted-foreground mb-10 font-light leading-relaxed relative"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.8, delay: index * 0.15 + 0.6 }}
                            >
                              {step.description}
                            </motion.p>
                            
                            <div className="space-y-8">
                              <motion.div
                                className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.15 + 0.7 }}
                              >
                                <h4 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-[#ff0000] rounded-full animate-pulse" />
                                  <span>What you&apos;ll do:</span>
                                </h4>
                                <ul className="space-y-4">
                                  {step.details.map((detail, detailIndex) => (
                                    <motion.li
                                      key={detailIndex}
                                      className="flex items-start space-x-4 group/item"
                                      initial={{ opacity: 0, x: -30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ 
                                        duration: 0.6, 
                                        delay: index * 0.15 + 0.8 + detailIndex * 0.1 
                                      }}
                                      whileHover={{ x: 5 }}
                                    >
                                      <motion.div
                                        className="w-6 h-6 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg group-hover/item:scale-110 transition-transform duration-200"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <CheckCircle className="w-4 h-4 text-white" />
                                      </motion.div>
                                      <span className="text-muted-foreground text-lg leading-relaxed group-hover/item:text-foreground transition-colors duration-200">
                                        {detail}
                                      </span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.div>
                              
                              <motion.div
                                className="relative bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.15 + 0.9 }}
                              >
                                <h4 className="text-xl font-bold text-foreground mb-6 flex items-center space-x-3">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                  <span>Pro tips:</span>
                                </h4>
                                <ul className="space-y-3">
                                  {step.tips.map((tip, tipIndex) => (
                                    <motion.li
                                      key={tipIndex}
                                      className="flex items-start space-x-4 group/tip"
                                      initial={{ opacity: 0, x: -30 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ 
                                        duration: 0.6, 
                                        delay: index * 0.15 + 1.0 + tipIndex * 0.1 
                                      }}
                                      whileHover={{ x: 5 }}
                                    >
                                      <motion.div
                                        className="w-5 h-5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md group-hover/tip:scale-110 transition-transform duration-200"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.5 }}
                                      >
                                        <Star className="w-3 h-3 text-white" />
                                      </motion.div>
                                      <span className="text-muted-foreground leading-relaxed group-hover/tip:text-foreground transition-colors duration-200">
                                        {tip}
                                      </span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.div>
                            </div>
                          </motion.div>
                          
                          {/* Enhanced Visual with 3D Effects */}
                          <motion.div 
                            className="flex-1 flex justify-center relative"
                            initial={{ opacity: 0, scale: 0.8, rotateY: isEven ? 15 : -15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1, delay: index * 0.15 + 0.4 }}
                          >
                            <motion.div
                              className={`relative w-96 h-96 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl group/visual`}
                              whileHover={{ 
                                scale: 1.08,
                                rotateY: isEven ? -5 : 5,
                                rotateX: 5,
                                transition: { duration: 0.4 }
                              }}
                              style={{
                                transformStyle: "preserve-3d",
                                perspective: "1000px"
                              }}
                            >
                              {/* Animated background pattern */}
                              <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse-slow" />
                                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent animate-float-slow" />
                              </div>
                              
                              {/* Main icon with enhanced effects */}
                              <motion.div
                                className="relative z-10"
                                whileHover={{ 
                                  scale: 1.1,
                                  rotate: [0, 5, -5, 0],
                                  transition: { duration: 0.6 }
                                }}
                              >
                                <Icon className="w-40 h-40 text-white/90 drop-shadow-2xl" />
                                
                                {/* Glow effect behind icon */}
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl scale-150 opacity-50 group-hover/visual:opacity-75 transition-opacity duration-300" />
                              </motion.div>
                              
                              {/* Enhanced overlay gradients */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                              
                              {/* Floating step number badge */}
                              <motion.div 
                                className="absolute top-6 right-6 bg-white/25 backdrop-blur-md rounded-2xl px-4 py-2 shadow-xl border border-white/20"
                                animate={{
                                  y: [0, -5, 0],
                                  scale: [1, 1.05, 1]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                whileHover={{ 
                                  scale: 1.1,
                                  y: -10,
                                  transition: { duration: 0.3 }
                                }}
                              >
                                <span className="text-white font-bold text-lg">{step.number}</span>
                              </motion.div>
                              
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/visual:opacity-100 group-hover/visual:animate-shimmer transition-opacity duration-500" />
                              
                              {/* Floating particles */}
                              <div className="absolute inset-0 pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                                    style={{
                                      left: `${20 + i * 15}%`,
                                      top: `${30 + (i % 3) * 20}%`
                                    }}
                                    animate={{
                                      y: [0, -20, 0],
                                      opacity: [0.3, 0.8, 0.3],
                                      scale: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                      duration: 3 + i * 0.5,
                                      repeat: Infinity,
                                      delay: i * 0.3,
                                      ease: "easeInOut"
                                    }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Enhanced CTA Section */}
                  <motion.div
                    className="max-w-5xl mx-auto text-center mt-16 relative"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                  >
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000]/5 via-[#ff0000]/10 to-[#ff0000]/5 rounded-3xl blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#ff0000]/5 to-transparent rounded-3xl animate-pulse-slow" />
                    
                    <div className="relative bg-gradient-to-r from-[#ff0000]/10 via-[#ff0000]/5 to-[#ff0000]/10 border border-[#ff0000]/20 p-12 rounded-3xl backdrop-blur-sm overflow-hidden">
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      
                      <motion.h3 
                        className="text-4xl font-bold text-foreground mb-6 tracking-tight relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                      >
                        Ready to Get Started?
                      </motion.h3>
                      
                      <motion.p 
                        className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto font-light leading-relaxed relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                      >
                        Now that you know how it works, let&apos;s create your first multilingual dub!
                      </motion.p>
                      
                      <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6 }}
                      >
                        <motion.button
                          onClick={handleCloseModal}
                          className="group relative inline-flex items-center space-x-4 bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white px-10 py-5 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#ff0000]/50 focus:ring-offset-2 overflow-hidden"
                          whileHover={{ 
                            scale: 1.05,
                            boxShadow: "0 25px 50px -12px rgba(255, 0, 0, 0.4)"
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000] to-[#cc0000] blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                          
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
                          
                          <Upload className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                          <span className="relative z-10">Get Started</span>
                          
                          {/* Ripple effect on click */}
                          <div className="absolute inset-0 bg-white/20 rounded-2xl scale-0 group-active:scale-100 transition-transform duration-200" />
                        </motion.button>
                        
                        <motion.button
                          onClick={handleCloseModal}
                          className="group relative inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium rounded-xl hover:bg-[#ff0000] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-2 backdrop-blur-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>Learn More</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </motion.button>
                      </motion.div>
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

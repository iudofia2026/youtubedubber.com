'use client';

import React, { useState, useCallback, useMemo } from 'react';
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

  const steps = [
    { id: 0, title: 'Audio Setup', description: 'Prepare your audio files', icon: Scissors },
    { id: 1, title: 'Voice Track', description: 'Upload your voice-only audio file', icon: Mic },
    { id: 2, title: 'Background Track', description: 'Add background music (optional)', icon: Music },
    { id: 3, title: 'Target Languages', description: 'Select languages for dubbing', icon: Globe },
  ];

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
          
          {/* Dynamic Animated Header */}
          <motion.div
            className="text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 -z-10">
              {/* Floating Audio Waves */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-[#ff0000]/20 rounded-full"
                  style={{
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 15}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
              
              {/* Rotating Audio Spectrum */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#ff0000]/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Pulsing Center Dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#ff0000] rounded-full"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Main Title with Creative Typography */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4 tracking-tight relative">
                <motion.span
                  className="inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    background: "linear-gradient(90deg, #ff0000, #ff6666, #ff0000, #ff6666, #ff0000)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Create New Job
                </motion.span>
                
                {/* Animated Underline */}
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </h1>
              
              {/* Animated Subtitle */}
              <motion.p
                className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Transform your content into{" "}
                <motion.span
                  className="text-[#ff0000] font-semibold"
                  animate={{
                    textShadow: [
                      "0 0 0px #ff0000",
                      "0 0 10px #ff0000",
                      "0 0 0px #ff0000",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  multilingual masterpieces
                </motion.span>
              </motion.p>
            </motion.div>

            {/* Animated Progress Indicator */}
            <motion.div
              className="mt-8 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex items-center space-x-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-[#ff0000] rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
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
              {/* Step 0: Audio Setup Introduction */}
              {currentStep === 0 && (
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
                      Before we can create multilingual dubs, you'll need to split your video's audio into two separate MP3 files
                    </p>
                  </motion.div>

                  {/* Animated Visual Explanation */}
                  <motion.div
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <div className="relative bg-gradient-to-br from-card to-muted/30 border border-border rounded-lg p-8 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000]/10 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-l from-[#ff0000]/10 to-transparent" />
                      </div>

                      {/* Main Visual Container */}
                      <div className="relative z-10">
                        {/* Original Video */}
                        <motion.div
                          className="text-center mb-8"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                        >
                          <div className="inline-flex items-center justify-center w-24 h-16 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg shadow-lg mb-4">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Your Original Video</h3>
                          <p className="text-sm text-muted-foreground">Contains both voice and background audio</p>
                        </motion.div>

                        {/* Split Animation */}
                        <motion.div
                          className="flex items-center justify-center mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 1.2 }}
                        >
                          {/* Scissors Animation */}
                          <motion.div
                            className="relative"
                            animate={{
                              x: [0, 20, 0],
                              rotate: [0, 5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Scissors className="w-8 h-8 text-[#ff0000]" />
                          </motion.div>
                          
                          {/* Split Line */}
                          <motion.div
                            className="w-16 h-1 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent mx-4"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 1.5 }}
                          />
                          
                          <motion.div
                            className="relative"
                            animate={{
                              x: [0, -20, 0],
                              rotate: [0, -5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.5
                            }}
                          >
                            <Scissors className="w-8 h-8 text-[#ff0000]" />
                          </motion.div>
                        </motion.div>

                        {/* Split Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Voice Track */}
                          <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.8 }}
                          >
                            <motion.div
                              className="inline-flex items-center justify-center w-20 h-16 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg shadow-lg mb-4"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <Mic className="w-8 h-8 text-white" />
                              </motion.div>
                            </motion.div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">Voice Track</h4>
                            <p className="text-sm text-muted-foreground mb-3">Clean speech only</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                              <Volume2 className="w-4 h-4" />
                              <span>voice_only.mp3</span>
                            </div>
                          </motion.div>

                          {/* Background Track */}
                          <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 2.0 }}
                          >
                            <motion.div
                              className="inline-flex items-center justify-center w-20 h-16 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-lg shadow-lg mb-4"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div
                                animate={{
                                  y: [0, -2, 0],
                                  rotate: [0, 3, 0]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: 0.5
                                }}
                              >
                                <Music className="w-8 h-8 text-white" />
                              </motion.div>
                            </motion.div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">Background Track</h4>
                            <p className="text-sm text-muted-foreground mb-3">Music, SFX, ambient audio</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                              <VolumeX className="w-4 h-4" />
                              <span>background.mp3</span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Instructions */}
                  <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                  >
                    <div className="bg-muted/50 border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <div className="w-2 h-2 bg-[#ff0000] rounded-full mr-3" />
                        How to Split Your Audio
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#ff0000] text-white text-xs rounded-full flex items-center justify-center font-bold">1</span>
                          <p>Use any audio editing software (Audacity, Adobe Audition, DaVinci Resolve, etc.)</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#ff0000] text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
                          <p>Export your video's audio as an MP3 file</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#ff0000] text-white text-xs rounded-full flex items-center justify-center font-bold">3</span>
                          <p>Create two separate tracks: one with only voice, one with only background audio</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#ff0000] text-white text-xs rounded-full flex items-center justify-center font-bold">4</span>
                          <p>Export both as MP3 files with the same duration</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Call to Action */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <p className="text-lg text-foreground mb-6">
                      Ready to upload your split audio files?
                    </p>
                    <motion.div
                      className="inline-flex items-center space-x-2 text-[#ff0000] font-medium"
                      animate={{
                        x: [0, 5, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span>Let's get started</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                </div>
              )}

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
  );
}
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Globe, Download, Play, Mic, Headphones, Clock, CheckCircle, FileAudio, Languages, Zap, Shield, Users, Star } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Prepare Your Audio',
      description: 'Split your video audio into separate voice and background tracks for optimal dubbing quality.',
      icon: FileAudio,
      details: [
        'Import your video into any video editor',
        'Export voice track (speech only, no music)',
        'Export background track (music, SFX, ambient)',
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
        'Supported formats: MP3, WAV, M4A, FLAC',
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

  const features = [
    {
      icon: Mic,
      title: 'Voice Cloning Technology',
      description: 'Our AI learns your unique voice characteristics to create authentic-sounding dubs.',
      details: 'Advanced neural networks analyze your voice patterns, tone, and speaking style to generate natural-sounding speech in any language.'
    },
    {
      icon: Globe,
      title: '12+ Language Support',
      description: 'Comprehensive language coverage with native speaker quality and cultural adaptation.',
      details: 'From English to Japanese, Spanish to Arabic, our AI understands cultural nuances and regional accents for authentic results.'
    },
    {
      icon: Headphones,
      title: 'Professional Audio Quality',
      description: 'Studio-grade processing ensures your content sounds professional and broadcast-ready.',
      details: 'High-fidelity audio output with noise reduction, audio enhancement, and multiple format support for any platform.'
    },
    {
      icon: Clock,
      title: 'Lightning Fast Processing',
      description: 'Get your dubbed content ready in minutes, not hours, with our optimized pipeline.',
      details: 'Parallel processing technology and queue optimization deliver results quickly without compromising on quality.'
    }
  ];

  const useCases = [
    {
      title: 'YouTube Content Creators',
      description: 'Expand your global reach with multilingual versions of your videos.',
      icon: Play,
      benefits: ['Reach global audiences', 'Increase watch time', 'Boost subscriber growth', 'Monetize in new markets'],
      example: 'A tech reviewer creates English and Spanish versions of their latest iPhone review, reaching 2x more viewers.'
    },
    {
      title: 'Educational Content',
      description: 'Make learning accessible worldwide with translated educational materials.',
      icon: Users,
      benefits: ['Language learning', 'Global education', 'Accessibility', 'Cultural adaptation'],
      example: 'A coding tutorial channel creates versions in 5 languages, helping developers worldwide learn new skills.'
    },
    {
      title: 'Marketing & Advertising',
      description: 'Create localized campaigns that resonate with different cultural audiences.',
      icon: Star,
      benefits: ['Localized campaigns', 'Cultural relevance', 'Market expansion', 'ROI improvement'],
      example: 'A SaaS company creates product demos in 8 languages for their global launch campaign.'
    },
    {
      title: 'Podcasts & Audio Content',
      description: 'Transform your audio content for international listeners.',
      icon: Headphones,
      benefits: ['Global reach', 'Audio consistency', 'Brand expansion', 'Content localization'],
      example: 'A true crime podcast creates Spanish and French versions, growing their audience by 300%.'
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-[#ff0000]/1.5 via-transparent via-transparent to-[#ff0000]/1 pointer-events-none z-0 animate-float-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-tl from-transparent via-[#ff0000]/0.3 to-transparent pointer-events-none z-0 animate-drift-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/how-it-works" />
        
        <main>
          {/* Hero Section */}
          <motion.section
            className="py-20 sm:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center relative z-10">
              <motion.div
                className="inline-flex items-center text-[#ff0000] mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <YTdubberIcon size={80} className="mx-2 sm:mx-3 sm:w-24 sm:h-24 w-20 h-20" />
              </motion.div>
              
              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                How It
                <span className="block text-[#ff0000]">Works</span>
              </motion.h1>
              
              <motion.p
                className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Transform your content in just 4 simple steps. Our AI-powered platform 
                makes professional multilingual dubbing accessible to everyone.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/new">
                  <motion.button
                    className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Try It Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <Link href="/features">
                  <motion.button
                    className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Star className="w-5 h-5" />
                    <span>View Features</span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* Steps Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  Simple 4-Step
                  <span className="text-[#ff0000]"> Process</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  From audio preparation to final download, our streamlined process 
                  makes multilingual dubbing effortless.
                </p>
              </motion.div>

              <div className="space-y-24">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isEven = index % 2 === 0;
                  
                  return (
                    <motion.div
                      key={step.number}
                      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.2 }}
                      viewport={{ once: true }}
                    >
                      {/* Content */}
                      <div className="flex-1">
                        <motion.div
                          className="flex items-center space-x-4 mb-6"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.2 + 0.2 }}
                          viewport={{ once: true }}
                        >
                          <div className={`w-16 h-16 bg-gradient-to-r ${step.color} flex items-center justify-center rounded-lg`}>
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
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                          viewport={{ once: true }}
                        >
                          {step.description}
                        </motion.p>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-4">What you'll do:</h4>
                            <ul className="space-y-3">
                              {step.details.map((detail, detailIndex) => (
                                <motion.li
                                  key={detailIndex}
                                  className="flex items-start space-x-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.6, delay: index * 0.2 + 0.4 + detailIndex * 0.1 }}
                                  viewport={{ once: true }}
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
                                  whileInView={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 + tipIndex * 0.1 }}
                                  viewport={{ once: true }}
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
                          className={`w-80 h-80 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center relative overflow-hidden`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
                          viewport={{ once: true }}
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
            </div>
          </motion.section>

          {/* Technology Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  Powered by
                  <span className="text-[#ff0000]"> Advanced AI</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  Our cutting-edge technology combines voice cloning, natural language processing, 
                  and audio engineering for professional results.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      className="bg-background border border-border p-8 hover:shadow-lg transition-all duration-300 text-center"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-16 h-16 bg-[#ff0000]/10 flex items-center justify-center mx-auto mb-6 border border-[#ff0000]/20">
                        <Icon className="w-8 h-8 text-[#ff0000]" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight">
                        {feature.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 font-light leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">
                        {feature.details}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Use Cases Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
                  Perfect for Every
                  <span className="text-[#ff0000]"> Creator</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  See how different creators use YT Dubber to expand their reach and grow their audiences.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, index) => {
                  const Icon = useCase.icon;
                  return (
                    <motion.div
                      key={useCase.title}
                      className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="w-14 h-14 bg-[#ff0000]/10 flex items-center justify-center border border-[#ff0000]/20 flex-shrink-0">
                          <Icon className="w-7 h-7 text-[#ff0000]" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                            {useCase.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-4 font-light leading-relaxed">
                            {useCase.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3">Benefits:</h4>
                        <ul className="space-y-2">
                          {useCase.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-[#ff0000] flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Real Example:</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {useCase.example}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                className="bg-gradient-to-r from-[#ff0000]/10 to-[#ff0000]/5 border border-[#ff0000]/20 p-12 rounded-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 tracking-tight">
                  Ready to Get Started?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                  Now that you know how it works, why not try it yourself? 
                  Start with our free plan and see the magic happen.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/new">
                    <motion.button
                      className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Start Your First Dub</span>
                    </motion.button>
                  </Link>
                  
                  <Link href="/pricing">
                    <motion.button
                      className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Shield className="w-5 h-5" />
                      <span>View Pricing</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Globe, Zap, DollarSign, BarChart3, Check, X, Scissors, Upload, Brain, Download } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const { user } = useAuth();

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Calculate opacity based on scroll position
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollY / 200); // Fade out over 200px of scroll

  return (
    <div className="min-h-screen relative">
      {/* Seamless gradient background covering entire page */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      
      {/* Additional gradient layers for depth with subtle animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-[#ff0000]/1.5 via-transparent via-transparent to-[#ff0000]/1 pointer-events-none z-0 animate-float-slow"></div>
      
      {/* Subtle animated accent layer */}
      <div className="fixed inset-0 bg-gradient-to-tl from-transparent via-[#ff0000]/0.3 to-transparent pointer-events-none z-0 animate-drift-slow"></div>
      
      {/* Content with proper z-index */}
      <div className="relative z-10">
        <Navigation currentPath="/" />
        
        <main>
          {/* Super Narrow Header with Pricing */}
          <motion.section
            className="py-6 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center relative z-10">
              <motion.div
                className="inline-flex items-center text-[#ff0000] mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <YTdubberIcon size={40} className="mx-2 sm:mx-3 sm:w-12 sm:h-12 w-10 h-10" />
                <span className="text-2xl sm:text-3xl font-bold">YT Dubber</span>
              </motion.div>
              
              <motion.h1
                className="text-xl sm:text-2xl font-bold text-foreground mb-2 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Simple, Transparent
                <span className="text-[#ff0000]"> Credit Pack Pricing</span>
              </motion.h1>
              
              <motion.p
                className="text-sm sm:text-base text-muted-foreground mb-4 max-w-2xl mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Buy credit packs that never expire. No subscriptions, no monthly fees. 
                Start free and scale as you grow.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link href="/new">
                  <motion.button
                    className="inline-flex items-center space-x-2 bg-[#ff0000] text-white px-4 py-2 text-sm font-medium hover:bg-[#cc0000] transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Start Dubbing</span>
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </Link>
                
                {user && (
                  <Link href="/jobs">
                    <motion.button
                      className="inline-flex items-center space-x-2 border-2 border-[#ff0000] text-[#ff0000] px-4 py-2 text-sm font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>View Jobs</span>
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.section>


        {/* Pricing Section */}
        <motion.section
          className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 tracking-tight">
                Choose Your
                <span className="text-[#ff0000]"> Credit Pack</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                Credits never expire. No subscriptions, no monthly fees.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Starter Pack',
                  description: 'Perfect for trying out the service',
                  price: 'Free',
                  credits: '2 free jobs',
                  icon: '⚡',
                  color: 'from-blue-500 to-cyan-500',
                  popular: false,
                  features: [
                    '2 free dubbing jobs',
                    'Up to 5 minutes per job',
                    '2 languages included',
                    'Basic voice quality',
                    'Email support',
                    '48-hour file retention'
                  ],
                  limitations: [
                    'Limited to 2 jobs total',
                    'No background track support',
                    'Basic processing speed'
                  ],
                  cta: 'Get Started Free',
                  ctaLink: '/auth/signup'
                },
                {
                  name: 'Creator Pack',
                  description: 'Great value for regular creators',
                  price: '$29',
                  credits: '50 credits',
                  icon: '⭐',
                  color: 'from-purple-500 to-pink-500',
                  popular: true,
                  features: [
                    '50 dubbing credits',
                    'Up to 30 minutes per job',
                    'All 12+ languages',
                    'Premium voice quality',
                    'Dual track support',
                    'Priority processing',
                    'Email & chat support',
                    '7-day file retention',
                    'Batch processing',
                    'Custom voice settings'
                  ],
                  limitations: [],
                  cta: 'Buy Creator Pack',
                  ctaLink: '/auth/signup?plan=creator'
                },
                {
                  name: 'Professional Pack',
                  description: 'Best value for heavy users',
                  price: '$99',
                  credits: '250 credits',
                  icon: '👑',
                  color: 'from-yellow-500 to-orange-500',
                  popular: false,
                  features: [
                    '250 dubbing credits',
                    'Up to 2 hours per job',
                    'All 12+ languages',
                    'Studio-grade voice quality',
                    'Advanced audio processing',
                    'Real-time processing',
                    'Priority support',
                    '30-day file retention',
                    'API access',
                    'Team collaboration',
                    'Analytics dashboard',
                    'Custom integrations'
                  ],
                  limitations: [],
                  cta: 'Buy Professional Pack',
                  ctaLink: '/auth/signup?plan=professional'
                }
              ].map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`relative bg-card border rounded-lg p-8 ${
                    plan.popular 
                      ? 'border-[#ff0000] shadow-lg scale-105' 
                      : 'border-border hover:shadow-lg'
                  } transition-all duration-300`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.6 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#ff0000] text-white text-sm font-medium px-4 py-2 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4 rounded-lg`}>
                      <span className="text-4xl">{plan.icon}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-foreground">{plan.price}</div>
                      <div className="text-lg text-muted-foreground mt-1">{plan.credits}</div>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-[#ff0000] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start space-x-3">
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.ctaLink}>
                    <motion.button
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                        plan.popular
                          ? 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          {/* Subtle background overlay for features */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none"></div>
          <motion.div 
            className="text-center mb-12 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            
            <motion.div
              className="relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                <span className="relative">
                  Why Choose Our Platform?
                  {/* Subtle text shadow for depth */}
                  <motion.span 
                    className="absolute inset-0 text-[#ff0000]/20 blur-sm -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                  >
                    Why Choose Our Platform?
                  </motion.span>
                </span>
              </motion.h2>
            </motion.div>
            
            <motion.div
              className="relative max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground font-light leading-relaxed relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.0 }}
              >
                <motion.span
                  className="inline-block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Professional-quality dubbing
                </motion.span>
                <motion.span 
                  className="text-[#ff0000] font-medium mx-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2.2 }}
                >
                  made simple
                </motion.span>
                <motion.span
                  className="inline-block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  and accessible
                </motion.span>
              </motion.p>
              
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Mic,
                title: 'High-Quality Audio',
                description: 'Advanced AI processing ensures natural-sounding voice dubbing with perfect timing and intonation.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Globe,
                title: 'Multiple Languages',
                description: 'Support for 12+ languages including English, Spanish, French, German, Japanese, and more.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Zap,
                title: 'Fast Processing',
                description: 'Get your dubbed content ready in minutes, not hours. Our optimized pipeline delivers results quickly.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: DollarSign,
                title: 'Best Value Pricing',
                description: 'Premium quality dubbing at unbeatable prices. We offer the best value compared to competitors like Rask and HeyGen.',
                color: 'from-green-500 to-emerald-500'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="text-center p-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 1.8 + index * 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                >
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4 rounded-lg`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 2.0 + index * 0.3,
                      type: "spring",
                      stiffness: 150,
                      damping: 20
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 2.2 + index * 0.3,
                        type: "spring",
                        stiffness: 150,
                        damping: 20
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 
                    className="text-lg font-semibold text-foreground mb-2 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 2.4 + index * 0.3,
                      ease: "easeOut"
                    }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-muted-foreground font-light leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 2.6 + index * 0.3,
                      ease: "easeOut"
                    }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* How it Works Section */}
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
                How It
                <span className="text-[#ff0000]"> Works</span>
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                Transform your content in just 4 simple steps. Our AI-powered platform 
                makes professional multilingual dubbing accessible to everyone.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: '01',
                  title: 'Prepare Your Audio',
                  description: 'Split your video audio into separate voice and background tracks for optimal dubbing quality.',
                  icon: Scissors,
                  color: 'from-blue-500 to-cyan-500',
                  details: ['Import your video', 'Split audio tracks', 'Export voice track', 'Export background track']
                },
                {
                  step: '02',
                  title: 'Upload Your Files',
                  description: 'Upload your prepared audio tracks and select your target languages for dubbing.',
                  icon: Upload,
                  color: 'from-purple-500 to-pink-500',
                  details: ['Upload voice track', 'Upload background track', 'Select languages', 'Review and confirm']
                },
                {
                  step: '03',
                  title: 'AI Processing',
                  description: 'Our advanced AI analyzes your voice and generates natural-sounding dubs in your chosen languages.',
                  icon: Brain,
                  color: 'from-yellow-500 to-orange-500',
                  details: ['Speech-to-text', 'Translation', 'Voice generation', 'Audio mixing']
                },
                {
                  step: '04',
                  title: 'Download & Use',
                  description: 'Download your completed dubs and integrate them into your content for maximum impact.',
                  icon: Download,
                  color: 'from-green-500 to-emerald-500',
                  details: ['Download voice tracks', 'Download full mixes', 'Get subtitles', 'Ready to publish']
                }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  className="text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-bold text-[#ff0000] bg-[#ff0000]/10 px-3 py-1 rounded-full">
                      Step {step.step}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 font-light leading-relaxed">
                    {step.description}
                  </p>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 bg-gradient-to-r ${step.color} rounded-full flex-shrink-0`}></div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/how-it-works">
                <motion.button
                  className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          {/* Enhanced gradient overlay for CTA */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff0000]/1 to-[#ff0000]/1.5 pointer-events-none"></div>
          <motion.div 
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.0 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.2 }}
            >
              Join thousands of content creators who trust our platform for their multilingual dubbing needs. 
              Start free with credit packs that never expire.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.4 }}
            >
              <Link href="/new">
                <motion.button
                  className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 2.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.8 }}
                  >
                    Create Your First Dub
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.8 }}
                    whileHover={{ x: 3 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
        </main>
      </div>
    </div>
  );
}
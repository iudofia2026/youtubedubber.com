'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Globe, Zap, DollarSign, Headphones, Clock, Shield, CheckCircle, Play, Download, Settings, FileAudio, Sparkles } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Mic,
      title: 'AI-Powered Voice Cloning',
      description: 'Advanced neural networks create natural-sounding voice dubs that match your original tone and style.',
      highlights: [
        'State-of-the-art voice synthesis',
        'Emotion and tone preservation',
        'Accent adaptation for authenticity',
        'Natural intonation patterns'
      ],
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Globe,
      title: '12+ Language Support',
      description: 'Comprehensive language coverage with native speaker quality and cultural adaptation.',
      highlights: [
        'English, Spanish, French, German',
        'Japanese, Chinese, Korean, Portuguese',
        'Italian, Russian, Arabic, Hindi',
        'Regional accent variations'
      ],
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Processing',
      description: 'Get your dubbed content ready in minutes, not hours. Our optimized pipeline delivers results quickly.',
      highlights: [
        '2-5 minute processing time',
        'Parallel processing technology',
        'Real-time progress tracking',
        'Queue optimization'
      ],
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: DollarSign,
      title: 'Competitive Pricing',
      description: 'Premium quality dubbing at unbeatable prices. Better value than Rask, HeyGen, and other competitors.',
      highlights: [
        'Pay-per-use model',
        'No hidden subscriptions',
        'Transparent pricing',
        'Volume discounts available'
      ],
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Headphones,
      title: 'Professional Audio Quality',
      description: 'Studio-grade audio processing ensures your content sounds professional and broadcast-ready.',
      highlights: [
        'High-fidelity audio output',
        'Noise reduction technology',
        'Audio enhancement algorithms',
        'Multiple format support'
      ],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your content is protected with enterprise-grade security. Files are automatically deleted after 48 hours.',
      highlights: [
        'End-to-end encryption',
        'Secure cloud processing',
        'Automatic file deletion',
        'GDPR compliance'
      ],
      color: 'from-red-500 to-rose-600'
    }
  ];

  const advancedFeatures = [
    {
      icon: FileAudio,
      title: 'Dual Track Support',
      description: 'Upload separate voice and background tracks for perfect audio separation and mixing.',
      details: 'Maintain perfect audio separation between voice and background music, allowing for precise control over the final mix.'
    },
    {
      icon: Globe,
      title: 'Multi-Language Batch Processing',
      description: 'Process multiple languages simultaneously to save time and reduce costs.',
      details: 'Upload once and generate dubs in multiple languages at the same time, with progress tracking for each language.'
    },
    {
      icon: Settings,
      title: 'Custom Voice Settings',
      description: 'Fine-tune voice characteristics to match your brand or personal style.',
      details: 'Adjust pitch, speed, and other voice parameters to create the perfect sound for your content.'
    },
    {
      icon: Settings,
      title: 'Analytics & Insights',
      description: 'Track your dubbing usage and get insights into your content performance.',
      details: 'Monitor processing times, language preferences, and usage patterns to optimize your workflow.'
    },
    {
      icon: Download,
      title: 'Multiple Export Formats',
      description: 'Export your dubbed content in various formats for different platforms.',
      details: 'Get voice-only tracks, full mixes, and subtitle files in formats optimized for YouTube, social media, and more.'
    },
    {
      icon: Clock,
      title: 'Scheduled Processing',
      description: 'Queue your dubbing jobs for processing during off-peak hours.',
      details: 'Schedule large batches of content for processing during low-traffic periods to save on costs.'
    }
  ];

  const comparisonFeatures = [
    {
      feature: 'Voice Quality',
      ytdubber: 'Studio-grade, natural-sounding AI',
      youtube: 'Manual recording required',
      elevenlabs: 'High-quality AI synthesis',
      competitors: 'Robotic, artificial voices'
    },
    {
      feature: 'Processing Speed',
      ytdubber: '2-5 minutes',
      youtube: 'Manual recording + editing',
      elevenlabs: '1-3 minutes',
      competitors: '15-30 minutes'
    },
    {
      feature: 'Language Support',
      ytdubber: '12+ languages',
      youtube: '3-4 languages only',
      elevenlabs: '29+ languages',
      competitors: '5-8 languages'
    },
    {
      feature: 'Pricing Model',
      ytdubber: 'Pay-per-use, transparent',
      youtube: 'Free but manual work',
      elevenlabs: 'Subscription ($5-330/month)',
      competitors: 'Subscription ($20-100+/month)'
    },
    {
      feature: 'Audio Separation',
      ytdubber: 'Dual track support',
      youtube: 'Single track only',
      elevenlabs: 'Single track only',
      competitors: 'Single track only'
    },
    {
      feature: 'Ease of Use',
      ytdubber: 'Upload & AI handles everything',
      youtube: 'Manual voice recording required',
      elevenlabs: 'Upload & generate',
      competitors: 'Complex setup process'
    },
    {
      feature: 'Voice Cloning',
      ytdubber: 'Advanced voice matching',
      youtube: 'Not available',
      elevenlabs: 'Voice cloning available',
      competitors: 'Limited voice options'
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
        <Navigation currentPath="/features" />
        
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
                Powerful Features for
                <span className="block text-[#ff0000]">Every Creator</span>
              </motion.h1>
              
              <motion.p
                className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Discover the comprehensive suite of features that make YT Dubber 
                the most advanced multilingual dubbing platform available.
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
                    <span>Try Features</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <Link href="/pricing">
                  <motion.button
                    className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>View Pricing</span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* Main Features Section */}
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
                  Core Features That
                  <span className="text-[#ff0000]"> Set Us Apart</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  Our platform combines cutting-edge AI technology with user-friendly design 
                  to deliver professional results every time.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mainFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300 group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground mb-4 tracking-tight">
                        {feature.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-6 font-light leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <ul className="space-y-3">
                        {feature.highlights.map((highlight, highlightIndex) => (
                          <li key={highlightIndex} className="flex items-start space-x-3 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-[#ff0000] flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Advanced Features Section */}
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
                  Advanced
                  <span className="text-[#ff0000]"> Capabilities</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  Go beyond basic dubbing with our advanced features designed for 
                  professional content creators and businesses.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {advancedFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      className="bg-background border border-border p-8 hover:shadow-lg transition-all duration-300 group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-14 h-14 bg-[#ff0000]/10 flex items-center justify-center mb-6 border border-[#ff0000]/20 group-hover:bg-[#ff0000]/20 transition-colors duration-300">
                        <Icon className="w-7 h-7 text-[#ff0000]" />
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

          {/* Comparison Section */}
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
                  Why Choose
                  <span className="text-[#ff0000]"> YT Dubber?</span>
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
                  See how we compare to YouTube&apos;s native dubbing and other platforms in the market.
                </p>
              </motion.div>

              <motion.div
                className="bg-card border border-border overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#ff0000]">YT Dubber</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">YouTube Native</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">ElevenLabs</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Other Platforms</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparisonFeatures.map((item, index) => (
                        <motion.tr
                          key={item.feature}
                          className="hover:bg-muted/30 transition-colors duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-foreground">{item.feature}</td>
                          <td className="px-6 py-4 text-center text-sm text-foreground">
                            <div className="flex items-center justify-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-[#ff0000]" />
                              <span>{item.ytdubber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-blue-600">
                            <div className="flex items-center justify-center space-x-2">
                              <span>{item.youtube}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-purple-600">
                            <div className="flex items-center justify-center space-x-2">
                              <span>{item.elevenlabs}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-muted-foreground">{item.competitors}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
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
                  Experience All Features Today
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-light leading-relaxed">
                  Ready to see these features in action? Start your first dubbing project 
                  and discover why creators choose YT Dubber.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/new">
                    <motion.button
                      className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Start Creating</span>
                    </motion.button>
                  </Link>
                  
                  <Link href="/how-it-works">
                    <motion.button
                      className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-5 h-5" />
                      <span>See How It Works</span>
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
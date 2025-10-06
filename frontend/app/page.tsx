'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Globe, Zap, DollarSign, BarChart3 } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function Home() {
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
          {/* Hero Section */}
          <motion.section
            className="py-20 sm:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
          <div className="text-center relative z-10">
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="inline-flex items-center text-[#ff0000]">
                YouTube
                <YTdubberIcon size={80} className="mx-2 sm:mx-3 sm:w-24 sm:h-24 w-20 h-20" />
                Dubber
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Transform your content with{" "}
              <span className="text-[#ff0000] font-medium">multilingual dubbing</span>
            </motion.p>
            
            <motion.p
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Upload your voice and background audio tracks, select your target language, 
              and let us create professional-quality multilingual dubs for your content
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <Link href="/new">
                <motion.button
                  className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Start Dubbing</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link href="/jobs">
                <motion.button
                  className="inline-flex items-center space-x-3 border-2 border-[#ff0000] text-[#ff0000] px-8 py-4 text-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>View Jobs</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Scroll Indicator */}
        <motion.div
          className="flex flex-col items-center py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.p
            className="text-sm text-muted-foreground mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            learn more
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
            {/* Decorative accent line */}
            <motion.div 
              className="w-16 h-1 bg-gradient-to-r from-transparent via-[#ff0000] to-transparent mx-auto mb-6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
            />
            
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
              
              {/* Decorative dots */}
              <motion.div 
                className="flex justify-center space-x-2 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.4 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-[#ff0000]/30 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 2.6 + i * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ 
                      scale: 1.5,
                      backgroundColor: "#ff0000"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Creative Features Layout */}
          <div className="relative z-10">
            {/* Main Features Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* High-Quality Audio - Left Side */}
              <motion.div
                className="group relative"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.8, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-gradient-to-br from-[#ff0000]/5 to-transparent p-8 rounded-2xl border border-[#ff0000]/10 backdrop-blur-sm">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ff0000]/20 to-transparent rounded-bl-2xl"></div>
                  
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/10 rounded-xl flex items-center justify-center border border-[#ff0000]/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Mic className="w-8 h-8 text-[#ff0000]" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.h3 
                        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.0 }}
                      >
                        High-Quality Audio
                      </motion.h3>
                      <motion.p 
                        className="text-muted-foreground font-light leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.2 }}
                      >
                        Advanced AI processing ensures natural-sounding voice dubbing with perfect timing and intonation.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Multiple Languages - Right Side */}
              <motion.div
                className="group relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 2.0, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-gradient-to-bl from-[#ff0000]/5 to-transparent p-8 rounded-2xl border border-[#ff0000]/10 backdrop-blur-sm">
                  {/* Decorative corner accent */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#ff0000]/20 to-transparent rounded-br-2xl"></div>
                  
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/10 rounded-xl flex items-center justify-center border border-[#ff0000]/30"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Globe className="w-8 h-8 text-[#ff0000]" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.h3 
                        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.2 }}
                      >
                        Multiple Languages
                      </motion.h3>
                      <motion.p 
                        className="text-muted-foreground font-light leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.4 }}
                      >
                        Support for 12+ languages including English, Spanish, French, German, Japanese, and more.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row - Centered Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fast Processing */}
              <motion.div
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.2, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-gradient-to-tr from-[#ff0000]/5 to-transparent p-8 rounded-2xl border border-[#ff0000]/10 backdrop-blur-sm">
                  {/* Decorative corner accent */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#ff0000]/20 to-transparent rounded-tl-2xl"></div>
                  
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/10 rounded-xl flex items-center justify-center border border-[#ff0000]/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Zap className="w-8 h-8 text-[#ff0000]" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.h3 
                        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.4 }}
                      >
                        Fast Processing
                      </motion.h3>
                      <motion.p 
                        className="text-muted-foreground font-light leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.6 }}
                      >
                        Get your dubbed content ready in minutes, not hours. Our optimized pipeline delivers results quickly.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Best Value Pricing */}
              <motion.div
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.4, ease: "easeOut" }}
                whileHover={{ y: -8 }}
              >
                <div className="relative bg-gradient-to-tl from-[#ff0000]/5 to-transparent p-8 rounded-2xl border border-[#ff0000]/10 backdrop-blur-sm">
                  {/* Decorative corner accent */}
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#ff0000]/20 to-transparent rounded-tr-2xl"></div>
                  
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/10 rounded-xl flex items-center justify-center border border-[#ff0000]/30"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DollarSign className="w-8 h-8 text-[#ff0000]" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.h3 
                        className="text-2xl font-bold text-foreground mb-3 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.6 }}
                      >
                        Best Value Pricing
                      </motion.h3>
                      <motion.p 
                        className="text-muted-foreground font-light leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 2.8 }}
                      >
                        Premium quality dubbing at unbeatable prices. We offer the best value compared to competitors like Rask and HeyGen.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Globe, Zap } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/" />
      
      <main>
        {/* Hero Section */}
        <motion.section
          className="py-20 sm:py-32 relative overflow-hidden px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* YouTube-style background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff0000]/5 via-transparent to-[#ff0000]/5 pointer-events-none"></div>
          <div className="text-center relative z-10">
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-[#ff0000] drop-shadow-sm">YouTube</span> Multilingual
              <br />
              <span className="text-[#ff0000] drop-shadow-sm">Dubber</span>
            </motion.h1>
            
            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your content with AI-powered multilingual dubbing
            </motion.p>
            
            <motion.p
              className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Upload your voice and background audio tracks, select your target language, 
              and let our AI create professional-quality multilingual dubs for your content.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/new">
                <motion.button
                  className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-semibold hover:bg-[#cc0000] transition-colors duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Dubbing</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-quality dubbing made simple and accessible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Mic,
                title: 'High-Quality Audio',
                description: 'Advanced AI processing ensures natural-sounding voice dubbing with perfect timing and intonation.',
              },
              {
                icon: Globe,
                title: 'Multiple Languages',
                description: 'Support for 12+ languages including English, Spanish, French, German, Japanese, and more.',
              },
              {
                icon: Zap,
                title: 'Fast Processing',
                description: 'Get your dubbed content ready in minutes, not hours. Our optimized pipeline delivers results quickly.',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="text-center p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
                >
                  <div className="w-16 h-16 bg-[#ff0000]/10 flex items-center justify-center mx-auto mb-4 border border-[#ff0000]/20">
                    <Icon className="w-8 h-8 text-[#ff0000]" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of content creators who trust our platform for their multilingual dubbing needs.
            </p>
            <Link href="/new">
              <motion.button
                className="inline-flex items-center space-x-3 bg-[#ff0000] text-white px-8 py-4 text-lg font-semibold hover:bg-[#cc0000] transition-colors duration-200 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Create Your First Dub</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
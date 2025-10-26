'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Rocket, Sparkles, Star, Coins, Play, ArrowRight } from 'lucide-react';
import GamifiedCreditDisplay from './GamifiedCreditDisplay';
import AnimatedLever from './AnimatedLever';
import JobCostCalculator from './JobCostCalculator';

interface GamifiedLaunchScreenProps {
  onLaunch: () => void;
  isLaunching: boolean;
  userCredits: number;
  jobDuration: number; // in seconds
  targetLanguages: string[];
  className?: string;
}

const GamifiedLaunchScreen: React.FC<GamifiedLaunchScreenProps> = ({
  onLaunch,
  isLaunching,
  userCredits,
  jobDuration,
  targetLanguages,
  className = ''
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [jobCost, setJobCost] = useState(0);

  // Calculate job cost based on duration and languages
  useEffect(() => {
    const BASE_RATE = 0.1; // credits per second
    const LANGUAGE_MULTIPLIERS = {
      'common': 1.0,
      'uncommon': 1.2,
      'rare': 1.5
    };

    const commonLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'];
    const uncommonLanguages = ['ar', 'hi', 'th', 'vi', 'pl', 'tr', 'nl', 'sv', 'da', 'no'];
    
    let totalCost = 0;
    targetLanguages.forEach(lang => {
      let multiplier = 1.0;
      if (commonLanguages.includes(lang)) {
        multiplier = LANGUAGE_MULTIPLIERS.common;
      } else if (uncommonLanguages.includes(lang)) {
        multiplier = LANGUAGE_MULTIPLIERS.uncommon;
      } else {
        multiplier = LANGUAGE_MULTIPLIERS.rare;
      }
      totalCost += Math.ceil(jobDuration * BASE_RATE * multiplier);
    });
    
    setJobCost(totalCost);
  }, [jobDuration, targetLanguages]);

  const handleLeverActivation = () => {
    setIsActivated(true);
    setShowConfetti(true);
    
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
    
    // Launch the job after a short delay
    setTimeout(() => {
      onLaunch();
    }, 1500);
  };

  const canAfford = userCredits >= jobCost;

  return (
    <div className={`relative ${className}`}>
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-20, window.innerHeight + 20],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, 360],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-3 mb-4"
            animate={{
              scale: isActivated ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isActivated ? Infinity : 0,
            }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{
                rotate: isActivated ? [0, 360] : 0,
                scale: isActivated ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: isActivated ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Rocket className="w-8 h-8 text-white" />
            </motion.div>
            
            <div className="text-left">
              <h2 className="text-3xl font-black text-white mb-1">
                {isActivated ? 'LAUNCHING!' : 'READY TO LAUNCH'}
              </h2>
              <p className="text-slate-300 text-lg">
                {isActivated 
                  ? 'Your dubbing job is starting...' 
                  : 'Pull the lever to start your dubbing adventure!'
                }
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Credit Display and Cost Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GamifiedCreditDisplay
            balance={userCredits}
            jobCost={jobCost}
          />
          
          <JobCostCalculator
            duration={jobDuration}
            languages={targetLanguages}
          />
        </div>

        {/* Lever Section */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AnimatedLever
            onActivate={handleLeverActivation}
            isActivated={isActivated}
            isDisabled={!canAfford || isLaunching}
            className="w-full max-w-md"
          />
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {!canAfford && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                <Coins className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">
                  You need {jobCost - userCredits} more credits to launch this job
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launch Progress */}
        <AnimatePresence>
          {isLaunching && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="inline-flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-white font-bold text-lg">
                  Initializing your dubbing job...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fun Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(jobDuration / 60)}:{(jobDuration % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-slate-400">Duration</div>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-white">{targetLanguages.length}</div>
            <div className="text-sm text-slate-400">Languages</div>
          </div>

          <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <div className="text-2xl font-bold text-white">{jobCost}</div>
            <div className="text-sm text-slate-400">Credits</div>
          </div>
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
            <p className="text-slate-300 text-sm">
              🚀 <span className="text-white font-medium">Ready to reach global audiences?</span>{' '}
              Your content is about to go multilingual!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GamifiedLaunchScreen;
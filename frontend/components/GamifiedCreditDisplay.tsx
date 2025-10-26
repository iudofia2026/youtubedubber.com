'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, Star, Crown, Sparkles } from 'lucide-react';

interface GamifiedCreditDisplayProps {
  balance: number;
  jobCost: number;
  className?: string;
}

const GamifiedCreditDisplay: React.FC<GamifiedCreditDisplayProps> = ({
  balance,
  jobCost,
  className = ''
}) => {
  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const getCreditTier = (credits: number) => {
    if (credits >= 1000) return { 
      name: 'Master', 
      icon: Crown, 
      color: 'from-yellow-400 to-orange-500',
      glowColor: 'shadow-yellow-500/50',
      textColor: 'text-yellow-600'
    };
    if (credits >= 500) return { 
      name: 'Expert', 
      icon: Star, 
      color: 'from-purple-400 to-pink-500',
      glowColor: 'shadow-purple-500/50',
      textColor: 'text-purple-600'
    };
    if (credits >= 100) return { 
      name: 'Creator', 
      icon: Zap, 
      color: 'from-blue-400 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
      textColor: 'text-blue-600'
    };
    return { 
      name: 'Starter', 
      icon: Coins, 
      color: 'from-green-400 to-emerald-500',
      glowColor: 'shadow-green-500/50',
      textColor: 'text-green-600'
    };
  };

  const tier = getCreditTier(balance);
  const TierIcon = tier.icon;
  const remainingAfterJob = balance - jobCost;
  const canAfford = balance >= jobCost;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
    >
      {/* Main Credit Display */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-xl flex items-center justify-center ${tier.glowColor} shadow-lg`}
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <TierIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Your Power Level</h3>
              <p className={`text-sm font-medium ${tier.textColor}`}>
                {tier.name} Tier
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              canAfford 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
            animate={{ 
              scale: canAfford ? [1, 1.02, 1] : [1, 0.98, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {canAfford ? 'READY TO LAUNCH' : 'NEED MORE CREDITS'}
          </motion.div>
        </div>

        {/* Credit Balance */}
        <div className="relative z-10 mb-6">
          <div className="flex items-baseline space-x-2 mb-2">
            <motion.div
              className="text-4xl font-black text-white"
              animate={{ 
                textShadow: [
                  '0 0 0px rgba(255,255,255,0)',
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 0px rgba(255,255,255,0)'
                ]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {formatCredits(balance)}
            </motion.div>
            <span className="text-lg text-slate-300 font-medium">credits</span>
          </div>
          
          {/* Credit Bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${tier.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((balance / 1000) * 100, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Job Cost Breakdown */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">This job will cost:</span>
            <span className="text-white font-bold">{formatCredits(jobCost)} credits</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">You'll have left:</span>
            <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
              {formatCredits(remainingAfterJob)} credits
            </span>
          </div>

          {/* Cost Visualization */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${canAfford ? 'bg-green-500' : 'bg-red-500'} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((jobCost / balance) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-xs text-slate-400">
              {Math.round((jobCost / balance) * 100)}% of balance
            </span>
          </div>
        </div>

        {/* Floating Coins Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400 text-2xl"
              style={{
                left: `${10 + i * 30}%`,
                top: '20%',
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            >
              <Coins className="w-6 h-6" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GamifiedCreditDisplay;
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Clock, Globe, Zap, Coins } from 'lucide-react';

interface JobCostCalculatorProps {
  duration: number; // in seconds
  languages: string[];
  className?: string;
}

interface LanguageInfo {
  code: string;
  name: string;
  flag: string;
  classification: 'common' | 'uncommon' | 'rare';
  multiplier: number;
}

const LANGUAGE_INFO: Record<string, LanguageInfo> = {
  'en': { code: 'en', name: 'English', flag: '🇺🇸', classification: 'common', multiplier: 1.0 },
  'es': { code: 'es', name: 'Spanish', flag: '🇪🇸', classification: 'common', multiplier: 1.0 },
  'fr': { code: 'fr', name: 'French', flag: '🇫🇷', classification: 'common', multiplier: 1.0 },
  'de': { code: 'de', name: 'German', flag: '🇩🇪', classification: 'common', multiplier: 1.0 },
  'it': { code: 'it', name: 'Italian', flag: '🇮🇹', classification: 'common', multiplier: 1.0 },
  'pt': { code: 'pt', name: 'Portuguese', flag: '🇵🇹', classification: 'common', multiplier: 1.0 },
  'ru': { code: 'ru', name: 'Russian', flag: '🇷🇺', classification: 'common', multiplier: 1.0 },
  'ja': { code: 'ja', name: 'Japanese', flag: '🇯🇵', classification: 'common', multiplier: 1.0 },
  'ko': { code: 'ko', name: 'Korean', flag: '🇰🇷', classification: 'common', multiplier: 1.0 },
  'zh': { code: 'zh', name: 'Chinese', flag: '🇨🇳', classification: 'common', multiplier: 1.0 },
  'ar': { code: 'ar', name: 'Arabic', flag: '🇸🇦', classification: 'uncommon', multiplier: 1.2 },
  'hi': { code: 'hi', name: 'Hindi', flag: '🇮🇳', classification: 'uncommon', multiplier: 1.2 },
  'th': { code: 'th', name: 'Thai', flag: '🇹🇭', classification: 'uncommon', multiplier: 1.2 },
  'vi': { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', classification: 'uncommon', multiplier: 1.2 },
  'pl': { code: 'pl', name: 'Polish', flag: '🇵🇱', classification: 'uncommon', multiplier: 1.2 },
  'tr': { code: 'tr', name: 'Turkish', flag: '🇹🇷', classification: 'uncommon', multiplier: 1.2 },
  'nl': { code: 'nl', name: 'Dutch', flag: '🇳🇱', classification: 'uncommon', multiplier: 1.2 },
  'sv': { code: 'sv', name: 'Swedish', flag: '🇸🇪', classification: 'uncommon', multiplier: 1.2 },
  'da': { code: 'da', name: 'Danish', flag: '🇩🇰', classification: 'uncommon', multiplier: 1.2 },
  'no': { code: 'no', name: 'Norwegian', flag: '🇳🇴', classification: 'uncommon', multiplier: 1.2 },
  'af': { code: 'af', name: 'Afrikaans', flag: '🇿🇦', classification: 'rare', multiplier: 1.5 },
  'am': { code: 'am', name: 'Amharic', flag: '🇪🇹', classification: 'rare', multiplier: 1.5 },
  'az': { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', classification: 'rare', multiplier: 1.5 },
  'be': { code: 'be', name: 'Belarusian', flag: '🇧🇾', classification: 'rare', multiplier: 1.5 },
  'bg': { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', classification: 'rare', multiplier: 1.5 },
  'bn': { code: 'bn', name: 'Bengali', flag: '🇧🇩', classification: 'rare', multiplier: 1.5 },
  'bs': { code: 'bs', name: 'Bosnian', flag: '🇧🇦', classification: 'rare', multiplier: 1.5 },
  'ca': { code: 'ca', name: 'Catalan', flag: '🇪🇸', classification: 'rare', multiplier: 1.5 },
  'cs': { code: 'cs', name: 'Czech', flag: '🇨🇿', classification: 'rare', multiplier: 1.5 },
  'cy': { code: 'cy', name: 'Welsh', flag: '🇬🇧', classification: 'rare', multiplier: 1.5 },
  'et': { code: 'et', name: 'Estonian', flag: '🇪🇪', classification: 'rare', multiplier: 1.5 },
  'eu': { code: 'eu', name: 'Basque', flag: '🇪🇸', classification: 'rare', multiplier: 1.5 },
  'fa': { code: 'fa', name: 'Persian', flag: '🇮🇷', classification: 'rare', multiplier: 1.5 },
  'fi': { code: 'fi', name: 'Finnish', flag: '🇫🇮', classification: 'rare', multiplier: 1.5 },
  'gl': { code: 'gl', name: 'Galician', flag: '🇪🇸', classification: 'rare', multiplier: 1.5 },
  'gu': { code: 'gu', name: 'Gujarati', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'he': { code: 'he', name: 'Hebrew', flag: '🇮🇱', classification: 'rare', multiplier: 1.5 },
  'hr': { code: 'hr', name: 'Croatian', flag: '🇭🇷', classification: 'rare', multiplier: 1.5 },
  'hu': { code: 'hu', name: 'Hungarian', flag: '🇭🇺', classification: 'rare', multiplier: 1.5 },
  'hy': { code: 'hy', name: 'Armenian', flag: '🇦🇲', classification: 'rare', multiplier: 1.5 },
  'id': { code: 'id', name: 'Indonesian', flag: '🇮🇩', classification: 'rare', multiplier: 1.5 },
  'is': { code: 'is', name: 'Icelandic', flag: '🇮🇸', classification: 'rare', multiplier: 1.5 },
  'ka': { code: 'ka', name: 'Georgian', flag: '🇬🇪', classification: 'rare', multiplier: 1.5 },
  'kk': { code: 'kk', name: 'Kazakh', flag: '🇰🇿', classification: 'rare', multiplier: 1.5 },
  'km': { code: 'km', name: 'Khmer', flag: '🇰🇭', classification: 'rare', multiplier: 1.5 },
  'kn': { code: 'kn', name: 'Kannada', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'ky': { code: 'ky', name: 'Kyrgyz', flag: '🇰🇬', classification: 'rare', multiplier: 1.5 },
  'lo': { code: 'lo', name: 'Lao', flag: '🇱🇦', classification: 'rare', multiplier: 1.5 },
  'lt': { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', classification: 'rare', multiplier: 1.5 },
  'lv': { code: 'lv', name: 'Latvian', flag: '🇱🇻', classification: 'rare', multiplier: 1.5 },
  'mk': { code: 'mk', name: 'Macedonian', flag: '🇲🇰', classification: 'rare', multiplier: 1.5 },
  'ml': { code: 'ml', name: 'Malayalam', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'mn': { code: 'mn', name: 'Mongolian', flag: '🇲🇳', classification: 'rare', multiplier: 1.5 },
  'mr': { code: 'mr', name: 'Marathi', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'ms': { code: 'ms', name: 'Malay', flag: '🇲🇾', classification: 'rare', multiplier: 1.5 },
  'my': { code: 'my', name: 'Burmese', flag: '🇲🇲', classification: 'rare', multiplier: 1.5 },
  'ne': { code: 'ne', name: 'Nepali', flag: '🇳🇵', classification: 'rare', multiplier: 1.5 },
  'pa': { code: 'pa', name: 'Punjabi', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'ro': { code: 'ro', name: 'Romanian', flag: '🇷🇴', classification: 'rare', multiplier: 1.5 },
  'si': { code: 'si', name: 'Sinhala', flag: '🇱🇰', classification: 'rare', multiplier: 1.5 },
  'sk': { code: 'sk', name: 'Slovak', flag: '🇸🇰', classification: 'rare', multiplier: 1.5 },
  'sl': { code: 'sl', name: 'Slovenian', flag: '🇸🇮', classification: 'rare', multiplier: 1.5 },
  'sq': { code: 'sq', name: 'Albanian', flag: '🇦🇱', classification: 'rare', multiplier: 1.5 },
  'sr': { code: 'sr', name: 'Serbian', flag: '🇷🇸', classification: 'rare', multiplier: 1.5 },
  'sw': { code: 'sw', name: 'Swahili', flag: '🇹🇿', classification: 'rare', multiplier: 1.5 },
  'ta': { code: 'ta', name: 'Tamil', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'te': { code: 'te', name: 'Telugu', flag: '🇮🇳', classification: 'rare', multiplier: 1.5 },
  'tg': { code: 'tg', name: 'Tajik', flag: '🇹🇯', classification: 'rare', multiplier: 1.5 },
  'tl': { code: 'tl', name: 'Filipino', flag: '🇵🇭', classification: 'rare', multiplier: 1.5 },
  'uk': { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', classification: 'rare', multiplier: 1.5 },
  'ur': { code: 'ur', name: 'Urdu', flag: '🇵🇰', classification: 'rare', multiplier: 1.5 },
  'uz': { code: 'uz', name: 'Uzbek', flag: '🇺🇿', classification: 'rare', multiplier: 1.5 },
  'zu': { code: 'zu', name: 'Zulu', flag: '🇿🇦', classification: 'rare', multiplier: 1.5 },
};

const BASE_RATE = 0.1; // credits per second

const JobCostCalculator: React.FC<JobCostCalculatorProps> = ({
  duration,
  languages,
  className = ''
}) => {
  const [breakdown, setBreakdown] = useState<Array<{
    language: LanguageInfo;
    cost: number;
    rate: number;
  }>>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const calculateCost = () => {
      const newBreakdown = languages.map(langCode => {
        const langInfo = LANGUAGE_INFO[langCode] || {
          code: langCode,
          name: langCode.toUpperCase(),
          flag: '🌍',
          classification: 'common' as const,
          multiplier: 1.0
        };
        
        const rate = BASE_RATE * langInfo.multiplier;
        const cost = Math.ceil(duration * rate);
        
        return {
          language: langInfo,
          cost,
          rate
        };
      });

      const newTotalCost = newBreakdown.reduce((sum, item) => sum + item.cost, 0);
      
      setBreakdown(newBreakdown);
      setTotalCost(newTotalCost);
    };

    calculateCost();
  }, [duration, languages]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'common': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'uncommon': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'rare': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case 'common': return 'Standard';
      case 'uncommon': return 'Premium';
      case 'rare': return 'Expert';
      default: return 'Standard';
    }
  };

  return (
    <motion.div
      className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Calculator className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-bold text-white">Job Cost Breakdown</h3>
          <p className="text-sm text-slate-300">See exactly what you're spending</p>
        </div>
      </div>

      {/* Duration Info */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-xl">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <span className="text-slate-300">Duration:</span>
          <span className="text-white font-bold">{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Globe className="w-5 h-5 text-green-400" />
          <span className="text-slate-300">Languages:</span>
          <span className="text-white font-bold">{languages.length}</span>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="space-y-3 mb-6">
        {breakdown.map((item, index) => (
          <motion.div
            key={item.language.code}
            className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{item.language.flag}</span>
              <div>
                <div className="text-white font-medium">{item.language.name}</div>
                <div className={`text-xs px-2 py-1 rounded-full border ${getClassificationColor(item.language.classification)}`}>
                  {getClassificationLabel(item.language.classification)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{item.cost} credits</div>
              <div className="text-xs text-slate-400">
                {item.rate.toFixed(2)}/sec
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Cost */}
      <motion.div
        className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex items-center space-x-3">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-bold text-white">Total Cost:</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">{totalCost.toLocaleString()}</div>
          <div className="text-sm text-slate-300">credits</div>
        </div>
      </motion.div>

      {/* Value Proposition */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-slate-400">
          💡 <span className="text-slate-300">That's only</span>{' '}
          <span className="text-yellow-400 font-bold">
            ${(totalCost * 0.01).toFixed(2)}
          </span>{' '}
          <span className="text-slate-300">for professional dubbing!</span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default JobCostCalculator;
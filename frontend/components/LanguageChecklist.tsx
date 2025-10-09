'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, X, Globe, Star, Zap, Sparkles } from 'lucide-react';
import { LanguageChecklistProps, Language } from '@/types';

export function LanguageChecklist({ value, onChange, languages, error }: LanguageChecklistProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'european' | 'asian' | 'other'>('all');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLanguages = languages.filter(lang => value.includes(lang.code));

  // Language categories for better organization
  const languageCategories = {
    popular: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
    european: ['en', 'es', 'fr', 'de', 'pt', 'it', 'ru'],
    asian: ['ja', 'ko', 'zh', 'hi'],
    other: ['ar']
  };

  const getFilteredLanguagesByCategory = () => {
    if (selectedCategory === 'all') return filteredLanguages;
    return filteredLanguages.filter(lang => languageCategories[selectedCategory]?.includes(lang.code));
  };

  const handleToggle = (languageCode: string) => {
    if (value.includes(languageCode)) {
      onChange(value.filter(code => code !== languageCode));
    } else {
      onChange([...value, languageCode]);
    }
  };

  const handleRemove = (languageCode: string) => {
    onChange(value.filter(code => code !== languageCode));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectPopular = () => {
    onChange(languageCategories.popular);
  };

  const selectEuropean = () => {
    onChange(languageCategories.european);
  };

  const selectAsian = () => {
    onChange(languageCategories.asian);
  };

  return (
    <div className="space-y-8">
      {/* Header with Selection Count */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Target Languages
        </h3>
        <p className="text-muted-foreground mb-4">
          Select the languages you want to dub your content into
        </p>
        {value.length > 0 && (
          <motion.div
            className="inline-flex items-center space-x-2 bg-[#ff0000]/10 border border-[#ff0000]/20 px-4 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Globe className="w-4 h-4 text-[#ff0000]" />
            <span className="text-sm font-medium text-[#ff0000]">
              {value.length} language{value.length !== 1 ? 's' : ''} selected
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Selection Presets */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#ff0000]" />
          <span>Quick Select</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <motion.button
            onClick={selectPopular}
            className="flex items-center space-x-3 p-4 border-2 border-border hover:border-[#ff0000]/50 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground group-hover:text-[#ff0000] transition-colors">
                Popular
              </div>
              <div className="text-xs text-muted-foreground">
                EN, ES, FR, DE, JA, ZH
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={selectEuropean}
            className="flex items-center space-x-3 p-4 border-2 border-border hover:border-[#ff0000]/50 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground group-hover:text-[#ff0000] transition-colors">
                European
              </div>
              <div className="text-xs text-muted-foreground">
                EN, ES, FR, DE, PT, IT, RU
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={selectAsian}
            className="flex items-center space-x-3 p-4 border-2 border-border hover:border-[#ff0000]/50 rounded-lg transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-foreground group-hover:text-[#ff0000] transition-colors">
                Asian
              </div>
              <div className="text-xs text-muted-foreground">
                JA, KO, ZH, HI
              </div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Selected Languages Preview */}
      {selectedLanguages.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Selected Languages</h4>
            <motion.button
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-[#ff0000] transition-colors flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-3 h-3" />
              <span>Clear all</span>
            </motion.button>
          </div>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedLanguages.map((language) => (
              <motion.div
                key={language.code}
                className="flex items-center space-x-3 bg-gradient-to-r from-[#ff0000]/10 to-[#ff0000]/5 border border-[#ff0000]/20 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <div className="text-sm font-medium text-[#ff0000]">{language.name}</div>
                  <div className="text-xs text-muted-foreground uppercase">{language.code}</div>
                </div>
                <motion.button
                  onClick={() => handleRemove(language.code)}
                  className="text-[#ff0000]/60 hover:text-[#ff0000] transition-colors p-1"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Search Input */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 text-sm border-2 border-border focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50 focus:border-[#ff0000] bg-background rounded-lg transition-all duration-200"
        />
      </motion.div>

      {/* Language Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {getFilteredLanguagesByCategory().map((language, index) => {
          const isSelected = value.includes(language.code);
          const gradientColors = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-yellow-500 to-orange-500',
            'from-green-500 to-emerald-500',
            'from-red-500 to-rose-500',
            'from-indigo-500 to-purple-500',
            'from-pink-500 to-rose-500',
            'from-teal-500 to-cyan-500',
            'from-amber-500 to-yellow-500',
            'from-violet-500 to-purple-500',
            'from-emerald-500 to-green-500',
            'from-rose-500 to-pink-500'
          ];
          const colorIndex = index % gradientColors.length;
          
          return (
            <motion.button
              key={language.code}
              onClick={() => handleToggle(language.code)}
              className={`relative p-6 text-left transition-all duration-300 flex flex-col items-center space-y-3 border-2 rounded-xl group ${
                isSelected 
                  ? 'border-[#ff0000] bg-[#ff0000]/5 shadow-lg' 
                  : 'border-border hover:border-[#ff0000]/50 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Flag with gradient background */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isSelected 
                  ? `bg-gradient-to-r ${gradientColors[colorIndex]}` 
                  : 'bg-muted'
              } transition-all duration-300`}>
                <span className="text-3xl">{language.flag}</span>
              </div>
              
              {/* Language name */}
              <div className="text-center">
                <div className={`text-sm font-semibold transition-colors ${
                  isSelected ? 'text-[#ff0000]' : 'text-foreground group-hover:text-[#ff0000]'
                }`}>
                  {language.name}
                </div>
                <div className="text-xs text-muted-foreground uppercase font-mono">
                  {language.code}
                </div>
              </div>

              {/* Selection indicator */}
              <div className="absolute top-3 right-3">
                <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'border-[#ff0000] bg-[#ff0000]' 
                    : 'border-border group-hover:border-[#ff0000]/50'
                }`}>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#ff0000]/5 to-[#ff0000]/10' 
                  : 'bg-gradient-to-r from-[#ff0000]/0 to-[#ff0000]/0 group-hover:from-[#ff0000]/5 group-hover:to-[#ff0000]/10'
              }`} />
            </motion.button>
          );
        })}
      </motion.div>

      {/* No results message */}
      {getFilteredLanguagesByCategory().length === 0 && (
        <motion.div
          className="text-center py-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">🔍</div>
          <h4 className="text-lg font-semibold mb-2">No languages found</h4>
          <p className="text-sm">Try a different search term or category</p>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-destructive font-medium">{error}</p>
        </motion.div>
      )}

      {/* Help text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Pro tip:</strong> Use the quick select buttons above for common language combinations, 
          or search and select individual languages for a custom mix.
        </p>
      </motion.div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { LanguageChecklistProps, Language } from '@/types';

export function LanguageChecklist({ value, onChange, languages, error }: LanguageChecklistProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLanguages = languages.filter(lang => value.includes(lang.code));

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Target Languages
          <span className="text-[#ff0000] ml-1">*</span>
        </label>
        {value.length > 0 && (
          <motion.button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear all
          </motion.button>
        )}
      </div>

      {/* Selected Languages Preview */}
      {selectedLanguages.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedLanguages.map((language) => (
            <motion.div
              key={language.code}
              className="flex items-center space-x-2 bg-[#ff0000]/10 border border-[#ff0000]/20 px-3 py-2 rounded-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium text-[#ff0000]">{language.name}</span>
              <motion.button
                onClick={() => handleRemove(language.code)}
                className="text-[#ff0000]/60 hover:text-[#ff0000] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search and Expand Button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 border border-border hover:border-[#ff0000]/50 transition-colors duration-200 bg-background"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center space-x-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {value.length === 0 ? 'Select target languages' : `${value.length} language${value.length === 1 ? '' : 's'} selected`}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-border shadow-lg z-50 max-h-80 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search input */}
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50 focus:border-transparent bg-background"
                    autoFocus
                  />
                </div>
              </div>

              {/* Language checklist */}
              <div className="max-h-64 overflow-y-auto">
                {filteredLanguages.map((language) => {
                  const isSelected = value.includes(language.code);
                  return (
                    <motion.button
                      key={language.code}
                      onClick={() => handleToggle(language.code)}
                      className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center space-x-3 hover:bg-muted/50 ${
                        isSelected ? 'bg-[#ff0000]/5' : ''
                      }`}
                      whileHover={{ backgroundColor: 'var(--muted)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Custom checkbox */}
                      <div className="relative">
                        <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'border-[#ff0000] bg-[#ff0000]' 
                            : 'border-border hover:border-[#ff0000]/50'
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

                      {/* Language info */}
                      <div className="flex items-center space-x-3 flex-1">
                        <span className="text-2xl">{language.flag}</span>
                        <div className="flex-1">
                          <div className={`font-medium ${isSelected ? 'text-[#ff0000]' : 'text-foreground'}`}>
                            {language.name}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {language.code}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
                
                {filteredLanguages.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No languages found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          className="text-sm text-destructive"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Select one or more languages to dub your content into. You can search and filter languages easily.
      </p>
    </div>
  );
}
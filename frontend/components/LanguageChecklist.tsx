'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { LanguageChecklistProps, Language } from '@/types';

export function LanguageChecklist({ value, onChange, languages, error }: LanguageChecklistProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="space-y-6">
      {/* Header */}
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
              className="flex items-center space-x-2 bg-[#ff0000]/10 border border-[#ff0000]/20 px-3 py-2"
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

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-3 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-[#ff0000]/50 focus:border-transparent bg-background"
        />
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
        {filteredLanguages.map((language, index) => {
          const isSelected = value.includes(language.code);
          return (
            <motion.button
              key={language.code}
              onClick={() => handleToggle(language.code)}
              className={`p-4 text-left transition-all duration-200 flex flex-col items-center space-y-2 border-2 hover:border-[#ff0000]/50 ${
                isSelected 
                  ? 'border-[#ff0000] bg-[#ff0000]/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Flag */}
              <span className="text-3xl">{language.flag}</span>
              
              {/* Language name */}
              <div className="text-center">
                <div className={`text-sm font-medium ${isSelected ? 'text-[#ff0000]' : 'text-foreground'}`}>
                  {language.name}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {language.code}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div className="relative">
                <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#ff0000] bg-[#ff0000]' 
                    : 'border-border'
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
            </motion.button>
          );
        })}
      </div>

      {/* No results message */}
      {filteredLanguages.length === 0 && (
        <motion.div
          className="text-center py-8 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-2">🔍</div>
          <p>No languages found</p>
          <p className="text-sm">Try a different search term</p>
        </motion.div>
      )}

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
        Select one or more languages to dub your content into. Click on any language to select or deselect it.
      </p>
    </div>
  );
}
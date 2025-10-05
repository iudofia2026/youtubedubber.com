'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LanguageSelectProps, Language } from '@/types';

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLanguage = languages.find(lang => lang.code === value);

  const handleSelect = (language: Language) => {
    onChange(language.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Target Language
        <span className="text-[var(--youtube-red)] ml-1">*</span>
      </label>
      
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-12 text-left"
        >
          <div className="flex items-center space-x-3">
            {selectedLanguage ? (
              <>
                <span className="text-2xl">{selectedLanguage.flag}</span>
                <span className="font-medium">{selectedLanguage.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select a language</span>
            )}
          </div>
          <motion.svg
            className="w-4 h-4"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 max-h-64 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search input */}
              <div className="p-3 border-b">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--youtube-red)] focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Language list */}
              <div className="max-h-48 overflow-y-auto">
                {filteredLanguages.map((language) => (
                  <motion.button
                    key={language.code}
                    onClick={() => handleSelect(language)}
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center space-x-3 ${
                      value === language.code ? 'bg-[var(--youtube-red)]/10 text-[var(--youtube-red)]' : ''
                    }`}
                    whileHover={{ backgroundColor: 'var(--muted)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {language.code}
                      </div>
                    </div>
                    {value === language.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 bg-[var(--youtube-red)] rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
                
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

      {/* Selected language preview */}
      {selectedLanguage && (
        <motion.div
          className="mt-4 p-4 bg-muted/50 rounded-lg border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{selectedLanguage.flag}</span>
            <div>
              <h3 className="font-semibold">{selectedLanguage.name}</h3>
              <p className="text-sm text-muted-foreground">
                Your audio will be dubbed into {selectedLanguage.name}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check } from 'lucide-react';
import { LanguageSelectProps, Language } from '@/types';

export const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  languages,
  error,
  disabled = false,
  placeholder = 'Select a language...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>(languages);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLanguages(languages);
    } else {
      const filtered = languages.filter(lang =>
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLanguages(filtered);
    }
  }, [searchQuery, languages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleSelect = (language: Language) => {
    onChange(language.code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleToggle();
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const selectedLanguage = languages.find(lang => lang.code === value);
  const isError = !!error;

  return (
    <div className="w-full" ref={selectRef}>
      <label className="block text-sm font-medium text-foreground mb-2">
        Target Language
        <span className="text-destructive ml-1">*</span>
      </label>

      <div className="relative">
        <motion.button
          type="button"
          className={`
            w-full flex items-center justify-between px-3 py-2 border text-left
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary
            ${isError ? 'border-destructive bg-destructive/5' : 'border-border bg-background'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
            ${isOpen ? 'border-primary' : ''}
          `}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {selectedLanguage ? (
              <>
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span className="text-sm font-medium truncate">
                  {selectedLanguage.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute z-50 w-full mt-1 bg-background border border-border shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Input */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Language Options */}
              <div className="max-h-60 overflow-y-auto">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <motion.button
                      key={language.code}
                      type="button"
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2 text-left
                        transition-colors duration-150 hover:bg-accent
                        ${value === language.code ? 'bg-accent' : ''}
                      `}
                      onClick={() => handleSelect(language)}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="flex-1 text-sm font-medium">
                        {language.name}
                      </span>
                      {value === language.code && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </motion.button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No languages found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isError && (
        <motion.div
          className="flex items-center space-x-2 mt-2 text-destructive"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  );
};
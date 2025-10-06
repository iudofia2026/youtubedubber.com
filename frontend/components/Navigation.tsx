'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Plus, BarChart3, ChevronDown, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { NavigationProps } from '@/types';
import { ThemeToggleNav } from '@/components/ThemeToggleNav';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsJobsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'New Job',
      href: '/new',
      icon: Plus,
      current: pathname === '/new',
    },
  ];

  const jobsDropdownItems = [
    {
      name: 'All Jobs',
      href: '/jobs',
      icon: BarChart3,
      current: pathname === '/jobs' && !searchParams.get('status'),
    },
    {
      name: 'Processing',
      href: '/jobs?status=processing',
      icon: Loader2,
      current: pathname === '/jobs' && searchParams.get('status') === 'processing',
    },
    {
      name: 'Completed',
      href: '/jobs?status=complete',
      icon: CheckCircle,
      current: pathname === '/jobs' && searchParams.get('status') === 'complete',
    },
    {
      name: 'Pending',
      href: '/jobs?status=pending',
      icon: Clock,
      current: pathname === '/jobs' && searchParams.get('status') === 'pending',
    },
    {
      name: 'Errors',
      href: '/jobs?status=error',
      icon: AlertCircle,
      current: pathname === '/jobs' && searchParams.get('status') === 'error',
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <YTdubberIcon size={32} className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold text-foreground">
                YT Dubber
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-baseline space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors duration-200
                      ${item.current
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Jobs Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${pathname.startsWith('/jobs')
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary/50'
                    }
                  `}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Jobs</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isJobsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isJobsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                    >
                      {jobsDropdownItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`
                              flex items-center space-x-3 px-4 py-2 text-sm transition-colors duration-200
                              ${item.current
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }
                            `}
                            onClick={() => setIsJobsDropdownOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggleNav />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <motion.div
        className="md:hidden"
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 text-base font-medium transition-colors duration-200
                    ${item.current
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                  onClick={closeMobileMenu}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
          
          {/* Jobs Section */}
          <div className="border-t border-border pt-2 mt-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Jobs
            </div>
            {jobsDropdownItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 text-base font-medium transition-colors duration-200
                      ${item.current
                        ? 'text-primary bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }
                    `}
                    onClick={closeMobileMenu}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          
          {/* Mobile Theme Toggle */}
          <motion.div
            className="flex items-center justify-center py-3 border-t border-border mt-2"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <ThemeToggleNav />
          </motion.div>
        </div>
      </motion.div>
    </nav>
  );
};
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Plus, BarChart3, ChevronDown, Clock, CheckCircle, AlertCircle, Loader2, User, LogOut } from 'lucide-react';
import { NavigationProps } from '@/types';
import { ThemeToggleNav } from '@/components/ThemeToggleNav';
import { YTdubberIcon } from '@/components/YTdubberIcon';
import { useAuth } from '@/lib/auth-context';
import { UserProfile } from '@/components/auth/UserProfile';

export const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isJobsDropdownOpen, setIsJobsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  // Ensure we're on the client side and get current status
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setCurrentStatus(urlParams.get('status') || '');
    }
  }, []);

  // Close dropdowns when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsJobsDropdownOpen(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setIsUserMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);

  const navigationItems = React.useMemo(() => [
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
      requireAuth: true,
    },
  ], [pathname]);

  const jobsDropdownItems = React.useMemo(() => [
    {
      name: 'All Jobs',
      href: '/jobs',
      icon: BarChart3,
      current: isClient && pathname === '/jobs' && !currentStatus,
    },
    {
      name: 'Processing',
      href: '/jobs?status=processing',
      icon: Loader2,
      current: isClient && pathname === '/jobs' && currentStatus === 'processing',
    },
    {
      name: 'Completed',
      href: '/jobs?status=complete',
      icon: CheckCircle,
      current: isClient && pathname === '/jobs' && currentStatus === 'complete',
    },
    {
      name: 'Pending',
      href: '/jobs?status=pending',
      icon: Clock,
      current: isClient && pathname === '/jobs' && currentStatus === 'pending',
    },
    {
      name: 'Errors',
      href: '/jobs?status=error',
      icon: AlertCircle,
      current: isClient && pathname === '/jobs' && currentStatus === 'error',
    },
  ], [isClient, pathname, currentStatus]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close jobs dropdown when opening mobile menu
    if (!isMobileMenuOpen) {
      setIsJobsDropdownOpen(false);
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeJobsDropdown = useCallback(() => {
    setIsJobsDropdownOpen(false);
  }, []);

  const closeUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    closeUserMenu();
  }, [signOut, closeUserMenu]);

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
                // Don't show auth-required items if user is not logged in
                if (item.requireAuth && !user) return null;
                
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
              
              {/* Jobs Dropdown - Only show if user is logged in */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setIsJobsDropdownOpen(!isJobsDropdownOpen);
                    }}
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
                            onClick={closeJobsDropdown}
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
              )}
            </div>
            
            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="hidden lg:block">{user.user_metadata?.full_name || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <UserProfile onClose={closeUserMenu} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#ff0000] hover:bg-[#cc0000] rounded-lg transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggleNav />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              type="button"
              className="inline-flex items-center justify-center p-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary touch-manipulation"
              onClick={toggleMobileMenu}
              onTouchEnd={(e) => {
                e.preventDefault();
                toggleMobileMenu();
              }}
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
            // Don't show auth-required items if user is not logged in
            if (item.requireAuth && !user) return null;
            
            return (
              <motion.div
                key={item.name}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors duration-200 touch-manipulation
                    ${item.current
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                  onClick={closeMobileMenu}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
          
          {/* Jobs Section - Only show if user is logged in */}
          {user && (
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
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors duration-200 touch-manipulation
                        ${item.current
                          ? 'text-primary bg-accent'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }
                      `}
                      onClick={closeMobileMenu}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Auth Section */}
          <div className="border-t border-border pt-2 mt-2">
            {user ? (
              <div className="px-4 py-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-base font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 touch-manipulation rounded-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 touch-manipulation rounded-lg"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-[#ff0000] hover:bg-[#cc0000] transition-colors duration-200 touch-manipulation rounded-lg"
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
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
'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from '@/components/LoadingStates';
import { EmailVerificationPrompt } from '@/components/auth/EmailVerificationPrompt';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requireEmailVerification = true,
  redirectTo = '/auth/signin'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-[#ff0000]/1.5 via-transparent via-transparent to-[#ff0000]/1 pointer-events-none z-0 animate-float-slow"></div>
        <div className="fixed inset-0 bg-gradient-to-tl from-transparent via-[#ff0000]/0.3 to-transparent pointer-events-none z-0 animate-drift-slow"></div>
        
        <motion.div
          className="max-w-lg w-full text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            
            <motion.h1
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Welcome to
              <span className="text-[#ff0000]"> YT Dubber</span>
            </motion.h1>
            
            <motion.p
              className="text-lg text-muted-foreground mb-2 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Create professional multilingual dubs for your content
            </motion.p>
            
            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Sign in to access your dubbing jobs and start creating amazing content
            </motion.p>
          </div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href={redirectTo}>
              <motion.button
                className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-[#ff0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors duration-200 font-medium w-full text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Sign In to Continue</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </motion.button>
            </Link>
            
            <div className="flex items-center space-x-4 my-6">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            <Link href="/auth/signup">
              <motion.button
                className="inline-flex items-center justify-center space-x-3 px-8 py-4 border-2 border-[#ff0000] text-[#ff0000] rounded-lg hover:bg-[#ff0000] hover:text-white transition-colors duration-200 font-medium w-full text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Create Free Account</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </motion.button>
            </Link>
            
            <div className="mt-8 space-y-3">
              <Link href="/">
                <motion.button
                  className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  whileHover={{ x: -4 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </motion.button>
              </Link>
              
              <div className="text-center">
                <Link href="/how-it-works" className="text-sm text-[#ff0000] hover:underline">
                  Learn how it works
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Check email verification if required
  if (requireAuth && user && requireEmailVerification) {
    // Skip email verification check in dev mode
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || user.id === 'dev-user-123';

    if (!isDevMode) {
      // Check if email is verified
      const isEmailVerified = user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;

      if (!isEmailVerified) {
        return <EmailVerificationPrompt userEmail={user.email} />;
      }
    }
  }

  // If user is logged in but shouldn't be (e.g., on auth pages)
  if (!requireAuth && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Already Signed In</h1>
            <p className="text-muted-foreground">
              You are already signed in. Redirecting to your dashboard...
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#ff0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors duration-200 font-medium"
            >
              <span>Go to Dashboard</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated and can access the content
  return <>{children}</>;
}
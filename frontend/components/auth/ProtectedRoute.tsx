'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from '@/components/LoadingStates';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback, 
  requireAuth = true, 
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="w-16 h-16 bg-[#ff0000]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#ff0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
            <p className="text-muted-foreground">
              You need to be signed in to access this page.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href={redirectTo}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-[#ff0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors duration-200 font-medium"
            >
              <span>Sign In</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
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
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface EmailVerificationPromptProps {
  userEmail?: string;
  onClose?: () => void;
}

export function EmailVerificationPrompt({ userEmail, onClose }: EmailVerificationPromptProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { signOut } = useAuth();

  const handleResendEmail = async () => {
    if (!userEmail) {
      setResendStatus('error');
      setErrorMessage('Unable to resend email. Please try signing in again.');
      return;
    }

    setIsResending(true);
    setResendStatus('idle');
    setErrorMessage('');

    try {
      // Use backend API endpoint for resending verification email
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to resend verification email' }));
        throw new Error(errorData.detail || errorData.message || 'Failed to resend verification email');
      }

      setResendStatus('success');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/3 via-blue-500/1 to-blue-500/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>

      <motion.div
        className="max-w-lg w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* Icon */}
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-3xl font-bold text-foreground mb-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Verify Your Email
          </motion.h1>

          {/* Description */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-lg text-muted-foreground mb-4">
              Please verify your email address to access all features.
            </p>

            {userEmail && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-1">
                  We sent a verification email to:
                </p>
                <p className="text-foreground font-medium">
                  {userEmail}
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Click the verification link in your email to activate your account.
              If you don't see the email, check your spam folder.
            </p>
          </motion.div>

          {/* Status Messages */}
          {resendStatus === 'success' && (
            <motion.div
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Verification email sent! Please check your inbox.
                </p>
              </div>
            </motion.div>
          )}

          {resendStatus === 'error' && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Failed to send email</p>
                  {errorMessage && (
                    <p className="text-xs mt-1">{errorMessage}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Resend Email Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendStatus === 'success'}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : resendStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Email Sent</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 border-2 border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200 font-medium"
            >
              <span>Sign Out</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            className="mt-6 pt-6 border-t border-border text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              Having trouble?{' '}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Contact Support
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

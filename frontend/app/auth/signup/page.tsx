'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function SignUpPage() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signup');
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to jobs page after successful authentication
    router.push('/jobs');
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/auth/signup" />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full mb-4 shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <YTdubberIcon size={32} className="text-white" />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
                Join YT Dubber
              </h1>
              <p className="text-muted-foreground">
                Create your account to start dubbing content
              </p>
            </motion.div>

            {/* Auth Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AuthForm mode={mode} onModeChange={setMode} onSuccess={handleSuccess} />
            </motion.div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { config, getConfigStatus } from '@/lib/config';

interface ConfigValidatorProps {
  children: React.ReactNode;
}

export default function ConfigValidator({ children }: ConfigValidatorProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Validate configuration on client side
      const status = getConfigStatus();
      
      // Check if required configuration is present
      const hasRequiredConfig = status.required.apiUrl && status.required.appUrl;
      
      if (!hasRequiredConfig) {
        setError('Missing required configuration. Please check your environment variables.');
        setIsValid(false);
        return;
      }

      // Log configuration status in development
      if (config.isDevelopment) {
        console.log('🔧 Configuration Status:', status);
        
        if (config.isSupabaseConfigured) {
          console.log('✅ Supabase: Configured');
        } else {
          console.log('⚠️ Supabase: Not configured (using dev mode)');
        }
        
        if (config.wsUrl) {
          console.log('✅ WebSocket: Configured');
        } else {
          console.log('⚠️ WebSocket: Not configured');
        }
      }

      setIsValid(true);
    } catch (err) {
      console.error('Configuration validation failed:', err);
      setError(err instanceof Error ? err.message : 'Configuration validation failed');
      setIsValid(false);
    }
  }, []);

  // Show loading state while validating
  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Validating configuration...</p>
        </div>
      </div>
    );
  }

  // Show error state if configuration is invalid
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/40 rounded-full">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Configuration Error
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>
            <div className="text-sm text-red-600 dark:text-red-400">
              <p className="mb-2">Please check your environment configuration:</p>
              <ul className="text-left space-y-1">
                <li>• Ensure .env.local file exists</li>
                <li>• Check that required variables are set</li>
                <li>• See .env.local.example for reference</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Configuration is valid, render children
  return <>{children}</>;
}
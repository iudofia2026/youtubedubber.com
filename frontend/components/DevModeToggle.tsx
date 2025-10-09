'use client';

import React, { useState, useEffect } from 'react';
import { Code, User, RefreshCw } from 'lucide-react';

interface DevModeToggleProps {
  className?: string;
}

export function DevModeToggle({ className = '' }: DevModeToggleProps) {
  const [isDevMode, setIsDevMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Ensure we're on the client side and check current state
  useEffect(() => {
    setIsClient(true);
    // Check localStorage first, then fallback to environment variable
    const storedPreference = localStorage.getItem('dev-mode-preference');
    const envDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    
    if (storedPreference !== null) {
      setIsDevMode(storedPreference === 'true');
    } else {
      setIsDevMode(envDevMode);
    }
  }, []);

  const toggleDevMode = async () => {
    if (!isClient || isToggling) return;

    setIsToggling(true);
    const newDevMode = !isDevMode;
    
    // Store the preference in localStorage
    localStorage.setItem('dev-mode-preference', newDevMode.toString());
    
    // Update the state immediately for better UX
    setIsDevMode(newDevMode);
    
    // Show a message to the user
    const message = newDevMode 
      ? 'Dev mode enabled! The page will refresh to activate.' 
      : 'Dev mode disabled! The page will refresh to activate.';
    
    // Show the message
    alert(message);
    
    // Refresh the page after a short delay to allow the user to see the message
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Don't render on server side
  if (!isClient) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleDevMode}
          disabled={isToggling}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg
            ${isDevMode 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
            }
            ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            backdrop-blur-sm border border-white/20
          `}
          title={isDevMode ? 'Currently in dev mode - click to disable' : 'Currently in normal mode - click to enable dev mode'}
        >
          {isToggling ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Switching...</span>
            </>
          ) : isDevMode ? (
            <>
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Dev Mode</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Normal Mode</span>
            </>
          )}
        </button>
        
        {/* Visual indicator */}
        <div className={`
          w-3 h-3 rounded-full transition-colors duration-200 shadow-sm
          ${isDevMode ? 'bg-orange-400' : 'bg-gray-400'}
          ${isToggling ? 'animate-pulse' : ''}
        `} />
      </div>
    </div>
  );
}

// Helper function to check if dev mode should be enabled
export function getDevModePreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem('dev-mode-preference');
  if (stored !== null) {
    return stored === 'true';
  }
  
  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
}

// Helper function to get the current dev mode status
export function isDevModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return getDevModePreference();
}
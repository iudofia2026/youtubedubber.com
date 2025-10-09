'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { useToastHelpers } from '@/components/ToastNotifications';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
  refreshToken: () => Promise<boolean>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToastHelpers();

  useEffect(() => {
    // Check if dev mode should be enabled (localStorage preference overrides env var)
    const isDevModeEnabled = () => {
      if (typeof window === 'undefined') return false;
      const storedPreference = localStorage.getItem('dev-mode-preference');
      if (storedPreference !== null) {
        return storedPreference === 'true';
      }
      return process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    };

    // Development bypass - if dev mode is enabled, simulate authenticated user
    if (isDevModeEnabled()) {
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@youtubedubber.com',
        user_metadata: {
          full_name: 'Development User'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        identities: [],
        factors: []
      } as User;
      
      setUser(mockUser);
      setSession({
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser
      } as Session);
      setLoading(false);
      return;
    }

    // If Supabase is not configured, skip auth initialization
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle auth events
      if (event === 'SIGNED_IN') {
        success('Welcome back!', 'You have successfully signed in.');
      } else if (event === 'SIGNED_OUT') {
        success('Signed out', 'You have been signed out successfully.');
      } else if (event === 'PASSWORD_RECOVERY') {
        success('Password reset sent', 'Check your email for password reset instructions.');
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, []); // Remove success from dependencies to prevent infinite re-renders

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      success('Development Mode', 'Sign up simulated in development mode.');
      return { error: null };
    }

    if (!isSupabaseConfigured()) {
      showError('Authentication not configured', 'Supabase is not configured. Please check your environment variables.');
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        showError('Sign up failed', error.message);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        success('Check your email', 'Please check your email to confirm your account.');
      }

      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      showError('Sign up failed', error.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      success('Development Mode', 'Sign in simulated in development mode.');
      return { error: null };
    }

    if (!supabase) {
      showError('Authentication not configured', 'Supabase is not configured. Please check your environment variables.');
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showError('Sign in failed', error.message);
        return { error };
      }

      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      showError('Sign in failed', error.message);
      return { error };
    }
  };

  const signOut = async () => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      setUser(null);
      setSession(null);
      success('Development Mode', 'Signed out in development mode.');
      return;
    }

    if (!supabase) {
      showError('Authentication not configured', 'Supabase is not configured. Please check your environment variables.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showError('Sign out failed', error.message);
      }
    } catch (err) {
      const error = err as AuthError;
      showError('Sign out failed', error.message);
    }
  };

  const resetPassword = async (email: string) => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      success('Development Mode', 'Password reset simulated in development mode.');
      return { error: null };
    }

    if (!supabase) {
      showError('Authentication not configured', 'Supabase is not configured. Please check your environment variables.');
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        showError('Password reset failed', error.message);
        return { error };
      }

      success('Password reset sent', 'Check your email for password reset instructions.');
      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      showError('Password reset failed', error.message);
      return { error };
    }
  };

  const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      success('Development Mode', 'Profile update simulated in development mode.');
      return { error: null };
    }

    if (!supabase) {
      showError('Authentication not configured', 'Supabase is not configured. Please check your environment variables.');
      return { error: { message: 'Supabase not configured' } as AuthError };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        showError('Profile update failed', error.message);
        return { error };
      }

      success('Profile updated', 'Your profile has been updated successfully.');
      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      showError('Profile update failed', error.message);
      return { error };
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      return true;
    }

    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Token refresh error:', err);
      return false;
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    // Development mode bypass
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      return 'dev-token';
    }

    if (!supabase) {
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshToken,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
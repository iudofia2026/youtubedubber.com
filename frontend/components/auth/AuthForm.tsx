'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Captcha, CaptchaRef } from '@/components/ui/captcha';
import { signUpSchema, signInSchema, resetPasswordSchema, type SignUpFormData, type SignInFormData, type ResetPasswordFormData } from '@/lib/auth-schemas';
import { useAuth } from '@/lib/auth-context';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onModeChange: (mode: 'signin' | 'signup' | 'reset') => void;
  onSuccess?: () => void;
}

export function AuthForm({ mode, onModeChange, onSuccess }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaRef>(null);
  const { signIn, signUp, resetPassword } = useAuth();

  const isCaptchaEnabled = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      captchaToken: '',
    },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      acceptTerms: false,
      captchaToken: '',
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaError = (error: Error) => {
    console.error('CAPTCHA error:', error);
    setCaptchaToken(null);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  // Reset captcha when switching modes
  useEffect(() => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  }, [mode]);

  const handleSignIn = async (data: SignInFormData) => {
    // Check captcha if enabled
    if (isCaptchaEnabled && !captchaToken) {
      return;
    }

    setIsLoading(true);
    try {
      // Include captcha token in form data if available
      const formDataWithCaptcha = {
        ...data,
        captchaToken: captchaToken || undefined,
      };

      const { error } = await signIn(formDataWithCaptcha.email, formDataWithCaptcha.password);
      if (!error) {
        onSuccess?.();
      } else {
        // Reset captcha on error
        setCaptchaToken(null);
        captchaRef.current?.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    // Check captcha if enabled
    if (isCaptchaEnabled && !captchaToken) {
      return;
    }

    setIsLoading(true);
    try {
      // Include captcha token in form data if available
      const formDataWithCaptcha = {
        ...data,
        captchaToken: captchaToken || undefined,
      };

      const { error } = await signUp(formDataWithCaptcha.email, formDataWithCaptcha.password, formDataWithCaptcha.fullName);
      if (!error) {
        onSuccess?.();
      } else {
        // Reset captcha on error
        setCaptchaToken(null);
        captchaRef.current?.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (!error) {
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mobile-form">
      <AnimatePresence mode="wait">
        {mode === 'signin' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
            </div>

            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 text-base touch-manipulation"
                    {...signInForm.register('email')}
                  />
                </div>
                {signInForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 h-12 text-base touch-manipulation"
                    {...signInForm.register('password')}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                      // Haptic feedback
                      if (navigator.vibrate) {
                        navigator.vibrate(30);
                      }
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rememberMe"
                    {...signInForm.register('rememberMe')}
                    className="touch-manipulation min-h-[44px] min-w-[44px]"
                  />
                  <Label htmlFor="rememberMe" className="text-sm touch-manipulation min-h-[44px] flex items-center">Remember me</Label>
                </div>
                <motion.button
                  type="button"
                  onClick={() => onModeChange('reset')}
                  className="text-sm text-[#ff0000] hover:underline touch-manipulation min-h-[44px] flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onModeChange('reset');
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                  }}
                >
                  Forgot password?
                </motion.button>
              </div>

              {isCaptchaEnabled && (
                <div className="flex justify-center">
                  <Captcha
                    ref={captchaRef}
                    onVerify={handleCaptchaVerify}
                    onError={handleCaptchaError}
                    onExpire={handleCaptchaExpire}
                  />
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || (isCaptchaEnabled && !captchaToken)}
                className="w-full bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (!isLoading && (!isCaptchaEnabled || captchaToken)) {
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              {isCaptchaEnabled && !captchaToken && (
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" />
                  Please complete the security verification
                </p>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <motion.button
                  onClick={() => onModeChange('signup')}
                  className="text-[#ff0000] hover:underline font-medium touch-manipulation min-h-[44px] flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onModeChange('signup');
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                  }}
                >
                  Sign up
                </motion.button>
              </p>
            </div>
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-muted-foreground">Sign up to start dubbing your content</p>
            </div>

            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 h-12 text-base touch-manipulation"
                    {...signUpForm.register('fullName')}
                  />
                </div>
                {signUpForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 text-base touch-manipulation"
                    {...signUpForm.register('email')}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 pr-12 h-12 text-base touch-manipulation"
                    {...signUpForm.register('password')}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                      // Haptic feedback
                      if (navigator.vibrate) {
                        navigator.vibrate(30);
                      }
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-12 h-12 text-base touch-manipulation"
                    {...signUpForm.register('confirmPassword')}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                      // Haptic feedback
                      if (navigator.vibrate) {
                        navigator.vibrate(30);
                      }
                    }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  {...signUpForm.register('acceptTerms')}
                  className="touch-manipulation min-h-[44px] min-w-[44px] mt-1"
                />
                <Label htmlFor="acceptTerms" className="text-sm touch-manipulation min-h-[44px] flex items-start pt-1">
                  I agree to the{' '}
                  <a href="/legal/terms" className="text-[#ff0000] hover:underline" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/legal/privacy" className="text-[#ff0000] hover:underline" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {signUpForm.formState.errors.acceptTerms && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.acceptTerms.message}</p>
              )}

              {isCaptchaEnabled && (
                <div className="flex justify-center">
                  <Captcha
                    ref={captchaRef}
                    onVerify={handleCaptchaVerify}
                    onError={handleCaptchaError}
                    onExpire={handleCaptchaExpire}
                  />
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || (isCaptchaEnabled && !captchaToken)}
                className="w-full bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (!isLoading && (!isCaptchaEnabled || captchaToken)) {
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              {isCaptchaEnabled && !captchaToken && (
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" />
                  Please complete the security verification
                </p>
              )}
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <motion.button
                  onClick={() => onModeChange('signin')}
                  className="text-[#ff0000] hover:underline font-medium touch-manipulation min-h-[44px] flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onModeChange('signin');
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                  }}
                >
                  Sign in
                </motion.button>
              </p>
            </div>
          </motion.div>
        )}

        {mode === 'reset' && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
              <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 text-base touch-manipulation"
                    {...resetForm.register('email')}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff0000] hover:bg-[#cc0000] text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 touch-manipulation min-h-[44px] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <motion.button
                  onClick={() => onModeChange('signin')}
                  className="text-[#ff0000] hover:underline font-medium touch-manipulation min-h-[44px] flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onModeChange('signin');
                    // Haptic feedback
                    if (navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                  }}
                >
                  Sign in
                </motion.button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
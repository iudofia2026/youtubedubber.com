'use client';

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { motion, AnimatePresence } from 'framer-motion';

interface CaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: Error) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
}

export interface CaptchaRef {
  execute: () => void;
  reset: () => void;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(
  ({ onVerify, onError, onExpire, className = '', theme = 'light', size = 'normal' }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);
    const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

    const handleVerify = useCallback(
      (token: string) => {
        onVerify(token);
      },
      [onVerify]
    );

    const handleError = useCallback(
      (error: string) => {
        if (onError) {
          onError(new Error(error));
        }
      },
      [onError]
    );

    const handleExpire = useCallback(() => {
      if (onExpire) {
        onExpire();
      }
    }, [onExpire]);

    useImperativeHandle(ref, () => ({
      execute: () => {
        captchaRef.current?.execute();
      },
      reset: () => {
        captchaRef.current?.resetCaptcha();
      },
    }));

    // Don't render if no site key is configured (dev mode)
    if (!siteKey) {
      return null;
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`captcha-container ${className}`}
        >
          <HCaptcha
            ref={captchaRef}
            sitekey={siteKey}
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleExpire}
            theme={theme}
            size={size}
          />
        </motion.div>
      </AnimatePresence>
    );
  }
);

Captcha.displayName = 'Captcha';

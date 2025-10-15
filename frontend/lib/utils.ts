import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mobile-specific utility functions
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getMobileViewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight;
}

export function addHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const duration = intensity === 'light' ? 30 : intensity === 'medium' ? 50 : 100;
    navigator.vibrate(duration);
  }
}

export function preventZoomOnFocus(): void {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
  }
}

export function enableZoomOnFocus(): void {
  if (typeof window === 'undefined') return;
  
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
  }
}

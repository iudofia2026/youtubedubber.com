'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'user-credits';

export function getCredits(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function setCredits(next: number) {
  if (typeof window === 'undefined') return;
  const safe = Math.max(0, Math.floor(next));
  window.localStorage.setItem(STORAGE_KEY, String(safe));
  // Proactively notify listeners in this tab
  try {
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: String(safe) }));
  } catch (_) {
    // No-op if StorageEvent init is restricted by the environment
  }
}

export function useCredits(): number {
  const [credits, setLocalCredits] = useState<number>(0);

  useEffect(() => {
    setLocalCredits(getCredits());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next = e.newValue ? parseInt(e.newValue, 10) : 0;
        setLocalCredits(Number.isFinite(next) ? next : 0);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return credits;
}

/**
 * Configuration validation and management for YT Dubber frontend
 * Provides centralized configuration with validation and error handling
 */

// Environment variable validation
const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

const optionalEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
} as const;

// Configuration interface
export interface AppConfig {
  // Required configuration
  apiUrl: string;
  appUrl: string;
  
  // Optional configuration
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  wsUrl?: string;
  devMode: boolean;
  stripePublishableKey?: string;
  gaTrackingId?: string;
  
  // Computed configuration
  isSupabaseConfigured: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
}

// Validate required environment variables
function validateRequiredEnvVars(): void {
  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See .env.local.example for reference.'
    );
  }
}

// Parse boolean environment variables
function parseBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// Create configuration object
function createConfig(): AppConfig {
  // Validate required variables
  validateRequiredEnvVars();
  
  const supabaseUrl = optionalEnvVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = optionalEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const devMode = parseBoolean(optionalEnvVars.NEXT_PUBLIC_DEV_MODE, false);
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Required configuration
    apiUrl: requiredEnvVars.NEXT_PUBLIC_API_URL!,
    appUrl: requiredEnvVars.NEXT_PUBLIC_APP_URL!,
    
    // Optional configuration
    supabaseUrl,
    supabaseAnonKey,
    wsUrl: optionalEnvVars.NEXT_PUBLIC_WS_URL,
    devMode,
    stripePublishableKey: optionalEnvVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    gaTrackingId: optionalEnvVars.NEXT_PUBLIC_GA_TRACKING_ID,
    
    // Computed configuration
    isSupabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    isProduction,
    isDevelopment,
  };
}

// Export configuration instance
export const config = createConfig();

// Export validation function for runtime checks
export function validateConfig(): void {
  try {
    createConfig();
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw error;
  }
}

// Export individual configuration getters for convenience
export const getApiUrl = () => config.apiUrl;
export const getAppUrl = () => config.appUrl;
export const getSupabaseUrl = () => config.supabaseUrl;
export const getSupabaseAnonKey = () => config.supabaseAnonKey;
export const getWsUrl = () => config.wsUrl;
export const isDevMode = () => config.devMode;
export const isSupabaseConfigured = () => config.isSupabaseConfigured;
export const isProduction = () => config.isProduction;
export const isDevelopment = () => config.isDevelopment;

// Export configuration status for debugging
export function getConfigStatus() {
  return {
    required: {
      apiUrl: !!config.apiUrl,
      appUrl: !!config.appUrl,
    },
    optional: {
      supabaseUrl: !!config.supabaseUrl,
      supabaseAnonKey: !!config.supabaseAnonKey,
      wsUrl: !!config.wsUrl,
      devMode: config.devMode,
      stripePublishableKey: !!config.stripePublishableKey,
      gaTrackingId: !!config.gaTrackingId,
    },
    computed: {
      isSupabaseConfigured: config.isSupabaseConfigured,
      isProduction: config.isProduction,
      isDevelopment: config.isDevelopment,
    },
  };
}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Ensure environment variables are available at build time
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
  },
  // Turbopack configuration
  turbopack: {
    // Set the root directory to avoid workspace detection issues
    root: __dirname,
  },
  // Add environment validation
  experimental: {
    // Enable experimental features if needed
  },
};

export default nextConfig;

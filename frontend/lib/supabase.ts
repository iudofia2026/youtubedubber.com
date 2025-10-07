import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Supabase features will be disabled.')
}

if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Supabase features will be disabled.')
}

// Create Supabase client only if both environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database types (will be generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'complete' | 'error'
          progress: number
          message: string
          voice_track_duration: number
          target_languages: string[]
          background_track: boolean
          completed_languages: number
          total_languages: number
          created_at: string
          updated_at: string
          estimated_completion: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'processing' | 'complete' | 'error'
          progress?: number
          message?: string
          voice_track_duration: number
          target_languages: string[]
          background_track?: boolean
          completed_languages?: number
          total_languages?: number
          created_at?: string
          updated_at?: string
          estimated_completion?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'complete' | 'error'
          progress?: number
          message?: string
          voice_track_duration?: number
          target_languages?: string[]
          background_track?: boolean
          completed_languages?: number
          total_languages?: number
          created_at?: string
          updated_at?: string
          estimated_completion?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
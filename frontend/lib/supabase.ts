import { createClient } from '@supabase/supabase-js'
import { config, isSupabaseConfigured } from './config'

// Create Supabase client only if both environment variables are available
export const supabase = config.isSupabaseConfigured 
  ? createClient(config.supabaseUrl!, config.supabaseAnonKey!)
  : null

// Log configuration status
if (config.isDevelopment) {
  if (config.isSupabaseConfigured) {
    console.log('✅ Supabase configured successfully')
  } else {
    console.warn('⚠️ Supabase not configured - using development mode')
  }
}

// Export the configuration check function
export { isSupabaseConfigured }

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
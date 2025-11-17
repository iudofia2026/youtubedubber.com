-- Migration: Add file path columns to dubbing_jobs table
-- Date: 2025-11-01
-- Purpose: Store voice_track_url and background_track_url for worker processing

-- Add voice_track_url column
ALTER TABLE dubbing_jobs
ADD COLUMN IF NOT EXISTS voice_track_url TEXT;

-- Add background_track_url column (optional)
ALTER TABLE dubbing_jobs
ADD COLUMN IF NOT EXISTS background_track_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN dubbing_jobs.voice_track_url IS 'Storage path for the voice track file';
COMMENT ON COLUMN dubbing_jobs.background_track_url IS 'Storage path for the background track file (optional)';

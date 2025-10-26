// Core types for the YouTube Multilingual Dubber app

export interface FileUploadProps {
  label: string;
  required?: boolean;
  accept: string;
  maxSize: number; // in MB
  onFileSelect: (file: File | null) => void;
  onDurationChange?: (duration: number | null) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: string) => void;
  onAutoNavigate?: () => void;
  error?: string;
  value?: File | null;
  duration?: number | null;
  durationFormatted?: string;
  isUploading?: boolean;
  uploadProgress?: UploadProgress;
  autoNavigate?: boolean;
}

export interface UploadProgress {
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'validating' | 'complete' | 'error';
  message: string;
  speed?: number; // bytes per second
  estimatedTime?: number; // seconds remaining
  bytesUploaded?: number;
  totalBytes?: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface LanguageSelectProps {
  value: string;
  onChange: (language: string) => void;
  languages: Language[];
  error?: string;
}

export interface LanguageChecklistProps {
  value: string[];
  onChange: (languages: string[]) => void;
  languages: Language[];
  error?: string;
  onAutoNavigate?: () => void;
  autoNavigate?: boolean;
}

export interface ProgressBarProps {
  progress: number; // 0-100
  status: string;
  isComplete: boolean;
  showPercentage?: boolean;
  animated?: boolean;
}

export interface DubbingJobData {
  voiceTrack: File;
  backgroundTrack?: File;
  targetLanguages: string[];
}

export interface SignedUploadUrls {
  job_id: string;
  upload_urls: {
    voice_track: string;
    background_track?: string;
  };
}

export interface UploadUrlsRequest {
  languages: string[];
  voice_track_name: string;
  background_track_name?: string;
}

export interface JobCreationRequest {
  job_id: string;
  voice_track_uploaded: boolean;
  background_track_uploaded: boolean;
  languages: string[];
}

export interface LanguageProgress {
  languageCode: string;
  languageName: string;
  flag: string;
  status: 'pending' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // in seconds
  fileSize?: number; // in bytes
  downloadUrl?: string;
}

export interface JobStatus {
  id: string;
  status: 'uploading' | 'processing' | 'generating' | 'finalizing' | 'complete' | 'error';
  progress: number;
  message: string;
  languages: LanguageProgress[];
  totalLanguages: number;
  completedLanguages: number;
  startedAt: string;
  estimatedCompletion?: string;
}

// Job interface for job history
export interface Job {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  createdAt: string;
  updatedAt: string;
  voiceTrackDuration: number; // in seconds
  targetLanguages: string[];
  backgroundTrack?: boolean;
  completedLanguages?: number;
  totalLanguages?: number;
  estimatedCompletion?: string;
  downloadUrls?: {
    [languageCode: string]: {
      voice: string;
      full: string;
      captions?: string;
    };
  };
}

export interface NavigationProps {
  currentPath: string;
}

// Mock API response types
export interface SubmitJobResponse {
  jobId: string;
}

export interface GetJobStatusResponse {
  id: string;
  status: JobStatus['status'];
  progress: number;
  message: string;
  languages: LanguageProgress[];
  totalLanguages: number;
  completedLanguages: number;
  startedAt: string;
  estimatedCompletion?: string;
}

// Language options
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

// Job status messages
export const JOB_STATUS_MESSAGES = {
  uploading: 'Uploading files...',
  processing: 'Processing audio...',
  generating: 'Generating dubs...',
  finalizing: 'Finalizing...',
  complete: 'Complete!',
} as const;

// Error handling types
export interface ApiError {
  type: 'network' | 'validation' | 'server' | 'auth' | 'not_found' | 'rate_limit' | 'unknown';
  message: string;
  details?: unknown;
  statusCode?: number;
  retryable?: boolean;
}

export interface BackendErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  voice_duration?: number;
  background_duration?: number;
  status_code?: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

// Download system types
export type DownloadFileType = 'voice' | 'full' | 'captions';

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface DownloadItem {
  id: string;
  jobId: string;
  languageCode: string;
  languageName: string;
  fileType: DownloadFileType;
  fileName: string;
  fileSize?: number;
  duration?: number;
  downloadUrl: string;
  status: DownloadStatus;
  progress: number; // 0-100
  error?: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface DownloadProgress {
  itemId: string;
  progress: number;
  status: DownloadStatus;
  message?: string;
  error?: string;
}

export interface BulkDownloadOptions {
  jobId: string;
  languages: string[];
  fileTypes: DownloadFileType[];
  includeCaptions?: boolean;
}

export interface DownloadHistoryItem {
  id: string;
  jobId: string;
  jobTitle: string;
  languageCode: string;
  languageName: string;
  fileType: DownloadFileType;
  fileName: string;
  fileSize?: number;
  downloadedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  downloadUrl?: string;
}

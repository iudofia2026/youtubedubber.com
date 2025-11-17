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
  voice_track_url?: string;
  background_track_url?: string;
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

// Backend response types for validation
// Note: Backend API uses camelCase (Pydantic schema), but we support both for robustness
export interface BackendLanguageProgress {
  // camelCase (official Pydantic schema)
  languageCode?: string;
  languageName?: string;
  flag?: string;
  status?: string;
  progress?: number;
  message?: string;
  estimatedTimeRemaining?: number;
  fileSize?: number;
  downloadUrl?: string;
  // snake_case (legacy/fallback support)
  language_code?: string;
  language_name?: string;
  estimated_time_remaining?: number;
  file_size?: number;
  download_url?: string;
}

export type BackendJobDownloadUrls = Record<string, {
  voice?: string;
  full?: string;
  captions?: string;
} | undefined>;

export interface BackendJobResponse {
  // Common fields
  id?: string;
  status?: string;
  progress?: number;
  message?: string;
  languages?: BackendLanguageProgress[];
  // camelCase (official Pydantic schema)
  totalLanguages?: number;
  completedLanguages?: number;
  startedAt?: string;
  estimatedCompletion?: string;
  // snake_case (database fields/legacy support)
  job_id?: string;
  total_languages?: number;
  completed_languages?: number;
  started_at?: string;
  created_at?: string;
  updated_at?: string;
  estimated_completion?: string;
  voice_track_duration?: number;
  target_languages?: string[];
  background_track_uploaded?: boolean;
  download_urls?: BackendJobDownloadUrls;
}

export interface BackendSubmitJobResponse {
  job_id?: string;
  id?: string;
}

export interface BackendTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
}

export interface BackendPaymentIntent {
  client_secret?: string;
  clientSecret?: string;
}

export interface DownloadHistoryItemApi {
  id: string;
  job_id: string;
  job_title?: string;
  language_code: string;
  language_name?: string;
  file_type: 'voice' | 'full' | 'captions';
  file_name: string;
  file_size?: number;
  downloaded_at: string;
  expires_at?: string;
  is_expired?: boolean;
  download_url?: string;
}

// Type guard helpers
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

/**
 * Type guard for BackendLanguageProgress
 * Critical fields: languageCode OR language_code (supports both camelCase and snake_case)
 * Optional fields: All others (backend may not always provide them)
 */
export const isBackendLanguageProgress = (data: unknown): data is BackendLanguageProgress => {
  if (!isRecord(data)) return false;

  // Critical: must have languageCode (camelCase) OR language_code (snake_case)
  const hasLanguageCode = isString(data.languageCode) || isString(data.language_code);
  if (!hasLanguageCode) return false;

  // Optional fields - validate type if present (camelCase)
  if (data.languageName !== undefined && data.languageName !== null && !isString(data.languageName)) return false;
  if (data.flag !== undefined && data.flag !== null && !isString(data.flag)) return false;
  if (data.status !== undefined && data.status !== null && !isString(data.status)) return false;
  if (data.progress !== undefined && data.progress !== null && !isNumber(data.progress)) return false;
  if (data.message !== undefined && data.message !== null && !isString(data.message)) return false;
  if (data.estimatedTimeRemaining !== undefined && data.estimatedTimeRemaining !== null && !isNumber(data.estimatedTimeRemaining)) return false;
  if (data.fileSize !== undefined && data.fileSize !== null && !isNumber(data.fileSize)) return false;
  if (data.downloadUrl !== undefined && data.downloadUrl !== null && !isString(data.downloadUrl)) return false;

  // Optional fields - validate type if present (snake_case)
  if (data.language_name !== undefined && data.language_name !== null && !isString(data.language_name)) return false;
  if (data.estimated_time_remaining !== undefined && data.estimated_time_remaining !== null && !isNumber(data.estimated_time_remaining)) return false;
  if (data.file_size !== undefined && data.file_size !== null && !isNumber(data.file_size)) return false;
  if (data.download_url !== undefined && data.download_url !== null && !isString(data.download_url)) return false;

  return true;
};

/**
 * Type guard for BackendJobDownloadUrls
 * Validates the download URLs structure
 */
export const isBackendJobDownloadUrls = (data: unknown): data is BackendJobDownloadUrls => {
  if (!isRecord(data)) return false;

  // Each entry should be an object with optional voice, full, captions strings
  for (const value of Object.values(data)) {
    if (value === undefined || value === null) continue;
    if (!isRecord(value)) return false;

    if (value.voice !== undefined && value.voice !== null && !isString(value.voice)) return false;
    if (value.full !== undefined && value.full !== null && !isString(value.full)) return false;
    if (value.captions !== undefined && value.captions !== null && !isString(value.captions)) return false;
  }

  return true;
};

/**
 * Type guard for BackendJobResponse
 * Critical fields: Must have id (supports both camelCase and snake_case for other fields)
 * Optional fields: All others (backend contract varies during job lifecycle)
 */
export const isBackendJobResponse = (data: unknown): data is BackendJobResponse => {
  if (!isRecord(data)) return false;

  // Critical: must have id (primary) or job_id (fallback)
  const hasId = isString(data.id) || isString(data.job_id);
  if (!hasId) return false;

  // Common fields
  if (data.status !== undefined && data.status !== null && !isString(data.status)) return false;
  if (data.progress !== undefined && data.progress !== null && !isNumber(data.progress)) return false;
  if (data.message !== undefined && data.message !== null && !isString(data.message)) return false;

  // camelCase fields (Pydantic schema)
  if (data.totalLanguages !== undefined && data.totalLanguages !== null && !isNumber(data.totalLanguages)) return false;
  if (data.completedLanguages !== undefined && data.completedLanguages !== null && !isNumber(data.completedLanguages)) return false;
  if (data.startedAt !== undefined && data.startedAt !== null && !isString(data.startedAt)) return false;
  if (data.estimatedCompletion !== undefined && data.estimatedCompletion !== null && !isString(data.estimatedCompletion)) return false;

  // snake_case fields (database/legacy)
  if (data.total_languages !== undefined && data.total_languages !== null && !isNumber(data.total_languages)) return false;
  if (data.completed_languages !== undefined && data.completed_languages !== null && !isNumber(data.completed_languages)) return false;
  if (data.started_at !== undefined && data.started_at !== null && !isString(data.started_at)) return false;
  if (data.created_at !== undefined && data.created_at !== null && !isString(data.created_at)) return false;
  if (data.updated_at !== undefined && data.updated_at !== null && !isString(data.updated_at)) return false;
  if (data.estimated_completion !== undefined && data.estimated_completion !== null && !isString(data.estimated_completion)) return false;
  if (data.voice_track_duration !== undefined && data.voice_track_duration !== null && !isNumber(data.voice_track_duration)) return false;
  if (data.background_track_uploaded !== undefined && data.background_track_uploaded !== null && typeof data.background_track_uploaded !== 'boolean') return false;

  // Validate arrays
  if (data.languages !== undefined && data.languages !== null) {
    if (!isArray(data.languages)) return false;
    // Validate each language item
    for (const lang of data.languages) {
      if (!isBackendLanguageProgress(lang)) return false;
    }
  }

  if (data.target_languages !== undefined && data.target_languages !== null) {
    if (!isArray(data.target_languages)) return false;
    for (const lang of data.target_languages) {
      if (!isString(lang)) return false;
    }
  }

  // Validate download_urls structure
  if (data.download_urls !== undefined && data.download_urls !== null && !isBackendJobDownloadUrls(data.download_urls)) {
    return false;
  }

  return true;
};

/**
 * Type guard for BackendSubmitJobResponse
 * Critical fields: Must have either job_id or id
 */
export const isBackendSubmitJobResponse = (data: unknown): data is BackendSubmitJobResponse => {
  if (!isRecord(data)) return false;

  // Critical: must have either job_id or id
  const hasJobId = isString(data.job_id) || isString(data.id);
  return hasJobId;
};

/**
 * Type guard for BackendTransaction
 * Critical fields: id, amount, currency, status, created_at
 */
export const isBackendTransaction = (data: unknown): data is BackendTransaction => {
  if (!isRecord(data)) return false;

  // All required fields
  if (!isString(data.id)) return false;
  if (!isNumber(data.amount)) return false;
  if (!isString(data.currency)) return false;
  if (!isString(data.status)) return false;
  if (!isString(data.created_at)) return false;

  // Optional field
  if (data.description !== undefined && data.description !== null && !isString(data.description)) return false;

  return true;
};

/**
 * Type guard for BackendPaymentIntent
 * Critical fields: Must have either client_secret or clientSecret
 */
export const isBackendPaymentIntent = (data: unknown): data is BackendPaymentIntent => {
  if (!isRecord(data)) return false;

  // Must have either client_secret or clientSecret
  const hasClientSecret = isString(data.client_secret) || isString(data.clientSecret);
  return hasClientSecret;
};

/**
 * Type guard for DownloadHistoryItemApi
 * Critical fields: id, job_id, language_code, file_type, file_name, downloaded_at
 */
export const isDownloadHistoryItemApi = (data: unknown): data is DownloadHistoryItemApi => {
  if (!isRecord(data)) return false;

  // Required fields
  if (!isString(data.id)) return false;
  if (!isString(data.job_id)) return false;
  if (!isString(data.language_code)) return false;
  if (!isString(data.file_name)) return false;
  if (!isString(data.downloaded_at)) return false;

  // file_type must be one of the valid values
  if (!isString(data.file_type)) return false;
  if (!['voice', 'full', 'captions'].includes(data.file_type)) return false;

  // Optional fields
  if (data.job_title !== undefined && data.job_title !== null && !isString(data.job_title)) return false;
  if (data.language_name !== undefined && data.language_name !== null && !isString(data.language_name)) return false;
  if (data.file_size !== undefined && data.file_size !== null && !isNumber(data.file_size)) return false;
  if (data.expires_at !== undefined && data.expires_at !== null && !isString(data.expires_at)) return false;
  if (data.is_expired !== undefined && data.is_expired !== null && typeof data.is_expired !== 'boolean') return false;
  if (data.download_url !== undefined && data.download_url !== null && !isString(data.download_url)) return false;

  return true;
};

/**
 * Validation error class for type guard failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly data: unknown,
    public readonly validationType: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Creates a user-friendly validation error
 */
export const createValidationError = (
  validationType: string,
  data: unknown,
  userMessage?: string
): ValidationError => {
  const defaultMessage = 'The server returned unexpected data. Please try again or contact support if the issue persists.';
  const message = userMessage || defaultMessage;

  return new ValidationError(message, data, validationType);
};

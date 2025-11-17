import {
  DubbingJobData,
  SubmitJobResponse,
  GetJobStatusResponse,
  LanguageProgress,
  LANGUAGES,
  SignedUploadUrls,
  UploadUrlsRequest,
  JobCreationRequest,
  UploadProgress,
  Job,
  BackendLanguageProgress,
  BackendJobResponse,
  BackendSubmitJobResponse,
  BackendTransaction,
  BackendPaymentIntent,
  BackendJobDownloadUrls,
  DownloadHistoryItemApi,
  isBackendLanguageProgress,
  isBackendJobResponse,
  isBackendSubmitJobResponse,
  isBackendTransaction,
  isBackendPaymentIntent,
  isDownloadHistoryItemApi,
  createValidationError
} from '@/types';

import { config } from './config';

// API configuration
const API_BASE = config.apiUrl;
const API_BASE_NORMALIZED = API_BASE.replace(/\/+$/, '');

// Log API configuration for debugging
console.log('🔧 API Configuration:', {
  API_BASE,
  API_BASE_NORMALIZED,
  config: {
    apiUrl: config.apiUrl,
    devMode: config.devMode
  }
});

type JobStatusValue = GetJobStatusResponse['status'];
type LanguageStatusValue = LanguageProgress['status'];

const VALID_JOB_STATUSES: ReadonlyArray<JobStatusValue> = [
  'uploading',
  'processing',
  'generating',
  'finalizing',
  'complete',
  'error'
];

const VALID_LANGUAGE_STATUSES: ReadonlyArray<LanguageStatusValue> = [
  'pending',
  'processing',
  'generating',
  'finalizing',
  'complete',
  'error'
];

interface MapJobResponseOptions {
  targetLanguages?: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isValidJobStatus = (status: unknown): status is JobStatusValue => {
  return typeof status === 'string' && VALID_JOB_STATUSES.includes(status as JobStatusValue);
};

const isValidLanguageStatus = (status: unknown): status is LanguageStatusValue => {
  return typeof status === 'string' && VALID_LANGUAGE_STATUSES.includes(status as LanguageStatusValue);
};

const JOB_PREVIEW_STORAGE_PREFIX = 'yt-dubber:job-preview:';

/**
 * Resolves download URLs - converts relative URLs to absolute
 * Handles both absolute URLs (https://...) and relative paths (/downloads/...)
 */
const resolveDownloadUrl = (downloadUrl?: string): string | undefined => {
  if (!downloadUrl || typeof downloadUrl !== 'string') {
    return undefined;
  }

  // Trim whitespace
  const trimmed = downloadUrl.trim();
  if (!trimmed) {
    return undefined;
  }

  // Already absolute URL - return as-is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Relative URL - prepend API base
  const trimmedPath = trimmed.replace(/^\/+/, '');
  return `${API_BASE_NORMALIZED}/${trimmedPath}`;
};

/**
 * Maps download URLs object from backend to frontend format
 * Ensures all URLs are properly resolved (relative -> absolute)
 * Validates that required URLs (voice, full) are present
 */
const mapDownloadUrls = (downloadUrls?: BackendJobDownloadUrls): Job['downloadUrls'] | undefined => {
  if (!downloadUrls || typeof downloadUrls !== 'object') {
    return undefined;
  }

  const entries = Object.entries(downloadUrls).reduce<Record<string, { voice: string; full: string; captions?: string }>>((acc, [languageCode, urls]) => {
    // Skip invalid entries
    if (!urls || typeof urls !== 'object') {
      console.warn(`Invalid download URLs for language ${languageCode}:`, urls);
      return acc;
    }

    // Type assertion for urls object
    const urlsObj = urls as { voice?: string; full?: string; captions?: string };

    const voiceUrl = resolveDownloadUrl(urlsObj.voice);
    const fullUrl = resolveDownloadUrl(urlsObj.full);

    // Both voice and full URLs are required for a valid entry
    if (!voiceUrl || !fullUrl) {
      console.warn(`Missing required download URLs for language ${languageCode}:`, { voice: voiceUrl, full: fullUrl });
      return acc;
    }

    const mapped: { voice: string; full: string; captions?: string } = {
      voice: voiceUrl,
      full: fullUrl
    };

    // Captions are optional
    const captionsUrl = resolveDownloadUrl(urlsObj.captions);
    if (captionsUrl) {
      mapped.captions = captionsUrl;
    }

    acc[languageCode] = mapped;
    return acc;
  }, {});

  return Object.keys(entries).length > 0 ? entries : undefined;
};

/**
 * Maps backend LanguageProgress to frontend LanguageProgress
 * Backend uses camelCase (matches LanguageProgress Pydantic schema)
 * Defensive programming: handles missing/null fields gracefully
 */
export const mapLanguageProgress = (language: unknown): LanguageProgress => {
  // Validate the incoming data structure
  if (!isBackendLanguageProgress(language)) {
    throw createValidationError(
      'BackendLanguageProgress',
      language,
      'Invalid language progress data received from server'
    );
  }

  // Extract languageCode (supports both camelCase and snake_case)
  const languageCode = language.languageCode || language.language_code;
  if (!languageCode) {
    throw createValidationError(
      'BackendLanguageProgress',
      language,
      'Language progress is missing language code'
    );
  }

  // Map backend language status to frontend status with type safety
  const rawStatus = language.status?.toLowerCase() || 'pending';
  const status = isValidLanguageStatus(rawStatus) ? rawStatus : 'pending';

  // Lookup language info from LANGUAGES constant for fallback
  const languageInfo = LANGUAGES.find(l => l.code === languageCode);

  // Extract values with fallbacks (supports both camelCase and snake_case)
  const languageName = language.languageName || language.language_name || languageInfo?.name || languageCode.toUpperCase();
  const flag = language.flag || languageInfo?.flag || '🌐';
  const progress = typeof language.progress === 'number' ? Math.max(0, Math.min(100, language.progress)) : 0;
  const message = language.message || 'Processing...';
  const estimatedTimeRemaining = language.estimatedTimeRemaining || language.estimated_time_remaining;
  const fileSize = language.fileSize || language.file_size;
  const downloadUrl = language.downloadUrl || language.download_url;

  return {
    languageCode,
    languageName,
    flag,
    status,
    progress,
    message,
    estimatedTimeRemaining: typeof estimatedTimeRemaining === 'number' ? estimatedTimeRemaining : undefined,
    fileSize: typeof fileSize === 'number' ? fileSize : undefined,
    downloadUrl: resolveDownloadUrl(downloadUrl)
  };
};

/**
 * Maps backend JobStatusResponse to frontend GetJobStatusResponse
 * Backend uses camelCase (matches JobStatusResponse Pydantic schema)
 * Handles both API responses and database records (which may have snake_case)
 */
export const mapJobResponse = (job: unknown, options: MapJobResponseOptions = {}): GetJobStatusResponse => {
  // Debug: Log validation attempt
  console.log('🔍 Validating job response:', JSON.stringify(job, null, 2));

  // Validate the incoming data structure
  if (!isBackendJobResponse(job)) {
    console.error('❌ Validation failed for job response:', job);
    console.error('Job type:', typeof job);
    console.error('Is object:', typeof job === 'object' && job !== null);
    console.error('Has id:', job && (typeof job === 'object') && ('id' in job || 'job_id' in job));

    throw createValidationError(
      'BackendJobResponse',
      job,
      'Invalid job response data received from server'
    );
  }

  console.log('✅ Job response passed validation');

  // Extract job ID (required field)
  const id = job.id || job.job_id;
  if (!id) {
    throw createValidationError(
      'BackendJobResponse',
      job,
      'Job response is missing job ID'
    );
  }

  // Map languages array with error handling for individual items
  const languages: LanguageProgress[] = [];
  if (Array.isArray(job.languages)) {
    for (const lang of job.languages) {
      try {
        languages.push(mapLanguageProgress(lang));
      } catch (error) {
        console.warn('Failed to map language progress:', lang, error);
        // Skip invalid language entries rather than failing entire job
      }
    }
  }

  // Calculate completed languages: prefer backend value, fallback to counting completed statuses
  // Supports both camelCase and snake_case
  const completedLanguages = typeof job.completedLanguages === 'number'
    ? job.completedLanguages
    : typeof job.completed_languages === 'number'
    ? job.completed_languages
    : languages.filter(language => language.status === 'complete').length;

  // Calculate total languages from multiple sources with priority
  // Supports both camelCase and snake_case
  const totalLanguages =
    typeof job.totalLanguages === 'number' ? job.totalLanguages :
    typeof job.total_languages === 'number' ? job.total_languages :
    languages.length > 0 ? languages.length :
    options.targetLanguages?.length || 0;

  // Map backend status to frontend status with validation
  const rawStatus = job.status?.toLowerCase() || 'processing';
  const status = isValidJobStatus(rawStatus) ? rawStatus : 'processing';

  // Progress should be clamped to 0-100 range
  const progress = typeof job.progress === 'number'
    ? Math.max(0, Math.min(100, job.progress))
    : 0;

  // Fallback chain for startedAt timestamp (supports both camelCase and snake_case)
  const startedAt = job.startedAt || job.started_at || job.created_at || new Date().toISOString();

  // estimatedCompletion supports both camelCase and snake_case
  const estimatedCompletion = job.estimatedCompletion || job.estimated_completion;

  return {
    id,
    status,
    progress,
    message: job.message || 'Processing...',
    languages,
    totalLanguages,
    completedLanguages,
    startedAt,
    estimatedCompletion
  };
};

/**
 * Maps backend job response to simplified Job summary for job list/history
 * Combines data from JobStatusResponse and additional database fields
 * Used for job listings where full detail isn't needed
 */
export const mapJobSummary = (job: unknown): Job => {
  // Validate the incoming data structure
  // Note: mapJobResponse will also validate, but we do it here for better error messages
  if (!isBackendJobResponse(job)) {
    throw createValidationError(
      'BackendJobResponse',
      job,
      'Invalid job data received from server'
    );
  }

  // Get full job status mapping first (reuses mapJobResponse logic which includes validation)
  const jobStatus = mapJobResponse(job, { targetLanguages: job.target_languages });

  // Map detailed GetJobStatusResponse status to simplified Job status
  const mapStatus = (status: string): Job['status'] => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'complete':
        return 'complete';
      case 'error':
        return 'error';
      case 'uploading':
      case 'processing':
      case 'generating':
      case 'finalizing':
        return 'processing';
      case 'pending':
      default:
        return 'pending';
    }
  };

  // Extract target languages from multiple possible sources
  const targetLanguages: string[] =
    job.target_languages ||
    job.languages?.map(lang => {
      // Support both camelCase and snake_case
      const langRecord = lang as Record<string, unknown>;
      return (langRecord.languageCode || langRecord.language_code) as string;
    }).filter(Boolean) ||
    [];

  // Timestamps with fallback chain (supports both camelCase and snake_case)
  const createdAt = job.created_at || job.startedAt || job.started_at || new Date().toISOString();
  const updatedAt = job.updated_at || job.created_at || job.startedAt || job.started_at || new Date().toISOString();

  return {
    id: jobStatus.id,
    status: mapStatus(jobStatus.status),
    progress: jobStatus.progress,
    message: jobStatus.message,
    createdAt,
    updatedAt,
    voiceTrackDuration: typeof job.voice_track_duration === 'number' ? job.voice_track_duration : 0,
    targetLanguages,
    backgroundTrack: job.background_track_uploaded ?? false,
    completedLanguages: jobStatus.completedLanguages,
    totalLanguages: jobStatus.totalLanguages,
    estimatedCompletion: jobStatus.estimatedCompletion,
    downloadUrls: mapDownloadUrls(job.download_urls)
  };
};

const getCachedJobPreview = (jobId: string): Job | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage = window.sessionStorage;
  const storageKey = `${JOB_PREVIEW_STORAGE_PREFIX}${jobId}`;
  const stored = storage.getItem(storageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Job;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
};

const mapMockJobToStatus = (job: Job, requestedLanguages: string[]): GetJobStatusResponse => {
  const jobStatusMap: Record<Job['status'], GetJobStatusResponse['status']> = {
    pending: 'uploading',
    processing: 'processing',
    complete: 'complete',
    error: 'error'
  };

  const languageStatusMap: Record<Job['status'], LanguageProgress['status']> = {
    pending: 'pending',
    processing: 'processing',
    complete: 'complete',
    error: 'error'
  };

  const progressValue = typeof job.progress === 'number' ? job.progress : 0;
  const messageValue = job.message || 'Processing...';
  const languageCodes = requestedLanguages.length > 0 ? requestedLanguages : job.targetLanguages;

  const languages = languageCodes.map((code) => {
    const info = LANGUAGES.find(lang => lang.code === code);
    const languageStatus = languageStatusMap[job.status] ?? 'processing';
    const progress = languageStatus === 'complete' ? 100 : progressValue;

    return {
      languageCode: code,
      languageName: info?.name || code.toUpperCase(),
      flag: info?.flag || '🌐',
      status: languageStatus,
      progress,
      message: languageStatus === 'complete' ? 'Complete' : messageValue,
      downloadUrl: resolveDownloadUrl(job.downloadUrls?.[code]?.full || job.downloadUrls?.[code]?.voice)
    };
  });

  const totalLanguages = job.totalLanguages ?? (languages.length || job.targetLanguages.length);
  const completedLanguages = job.completedLanguages ?? languages.filter(language => language.status === 'complete').length;

  return {
    id: job.id,
    status: jobStatusMap[job.status] ?? 'processing',
    progress: progressValue,
    message: messageValue,
    languages,
    totalLanguages,
    completedLanguages,
    startedAt: job.createdAt,
    estimatedCompletion: job.estimatedCompletion
  };
};

const getMockJobStatus = (jobId: string, targetLanguages: string[]): GetJobStatusResponse | null => {
  const job = getCachedJobPreview(jobId);
  if (!job) {
    return null;
  }

  return mapMockJobToStatus(job, targetLanguages);
};

const mapSubmitJobResponse = (data: unknown): SubmitJobResponse => {
  // Validate the incoming data structure
  if (!isBackendSubmitJobResponse(data)) {
    throw createValidationError(
      'BackendSubmitJobResponse',
      data,
      'Invalid job submission response received from server'
    );
  }

  const jobId = data.job_id || data.id;

  if (!jobId) {
    throw createValidationError(
      'BackendSubmitJobResponse',
      data,
      'Job submission response missing job ID'
    );
  }

  return { jobId };
};

// Error types for better error handling
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

const isBackendErrorResponse = (value: unknown): value is BackendErrorResponse => {
  if (!isRecord(value)) {
    return false;
  }

  const { error, message } = value as { error?: unknown; message?: unknown };
  return typeof error === 'string' || typeof message === 'string';
};

// Error handling utilities
export const createApiError = (error: unknown, response?: Response): ApiError => {
  // Network errors
  if (!response) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    return {
      type: 'network',
      message: 'Network error - please check your connection',
      details: config.devMode ? errorDetails : undefined,
      retryable: true
    };
  }

  // Parse backend error response
  if (response.headers.get('content-type')?.includes('application/json')) {
    const fallbackError: BackendErrorResponse = {
      error: 'unknown_error',
      message: typeof error === 'string' ? error : 'An unexpected error occurred'
    };

    const errorData: BackendErrorResponse = isBackendErrorResponse(error)
      ? error
      : fallbackError;
    
    switch (response.status) {
      case 400:
        if (errorData.error === 'duration_mismatch') {
          return {
            type: 'validation',
            message: `Audio tracks must be the same length. Voice: ${errorData.voice_duration}s, Background: ${errorData.background_duration}s`,
            details: config.devMode ? errorData : undefined,
            statusCode: 400,
            retryable: false
          };
        }
        return {
          type: 'validation',
          message: errorData.message || 'Invalid request data',
          details: config.devMode ? errorData : undefined,
          statusCode: 400,
          retryable: false
        };
      case 401:
        return {
          type: 'auth',
          message: 'Authentication required - please sign in',
          details: config.devMode ? errorData : undefined,
          statusCode: 401,
          retryable: false
        };
      case 403:
        return {
          type: 'auth',
          message: 'Access denied - insufficient permissions',
          details: config.devMode ? errorData : undefined,
          statusCode: 403,
          retryable: false
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found',
          details: config.devMode ? errorData : undefined,
          statusCode: 404,
          retryable: false
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests - please wait before trying again',
          details: config.devMode ? errorData : undefined,
          statusCode: 429,
          retryable: true
        };
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: 'server',
          message: 'Server error - please try again later',
          details: config.devMode ? errorData : undefined,
          statusCode: response.status,
          retryable: true
        };
      default:
        return {
          type: 'unknown',
          message: errorData.message || 'An unexpected error occurred',
          details: config.devMode ? errorData : undefined,
          statusCode: response.status,
          retryable: response.status >= 500
        };
    }
  }

  // Generic error based on status code
  switch (response.status) {
    case 400:
      return {
        type: 'validation',
        message: 'Invalid request - please check your data',
        statusCode: 400,
        retryable: false
      };
    case 401:
      return {
        type: 'auth',
        message: 'Authentication required',
        statusCode: 401,
        retryable: false
      };
    case 403:
      return {
        type: 'auth',
        message: 'Access denied',
        statusCode: 403,
        retryable: false
      };
    case 404:
      return {
        type: 'not_found',
        message: 'Resource not found',
        statusCode: 404,
        retryable: false
      };
    case 429:
      return {
        type: 'rate_limit',
        message: 'Too many requests - please wait',
        statusCode: 429,
        retryable: true
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: 'server',
        message: 'Server error - please try again later',
        statusCode: response.status,
        retryable: true
      };
    default:
      return {
        type: 'unknown',
        message: 'An unexpected error occurred',
        statusCode: response.status,
        retryable: response.status >= 500
      };
  }
};

// Retry utility with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry non-retryable errors
      const apiError = createApiError(error);
      if (!apiError.retryable) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Helper function to get auth headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Try to get the current session from Supabase
  if (typeof window !== 'undefined') {
    try {
      // Import supabase dynamically to avoid SSR issues
      const { supabase } = await import('./supabase');
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          console.log('🔐 Using Supabase auth token');
          return headers;  // Early return when token found
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // In development mode, use dev-token if no Supabase session exists
    if (config.devMode) {
      headers['Authorization'] = 'Bearer dev-token';
      console.log('🔐 Using dev-token (development mode)');
    } else {
      console.log('🔐 No authentication token available');
    }
  }

  return headers;
};

// Helper function to refresh token and retry request
const withTokenRefresh = async <T>(
  requestFn: (headers: Record<string, string>) => Promise<T>
): Promise<T> => {
  try {
    const headers = await getAuthHeaders();
    return await requestFn(headers);
  } catch (error) {
    // If it's a 401 error, try to refresh the token and retry
    if (error instanceof Error && error.message.includes('Authentication required')) {
      try {
        // Import supabase dynamically to avoid SSR issues
        const { supabase } = await import('./supabase');
        if (supabase) {
          const { data, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && data.session?.access_token) {
            const newHeaders = await getAuthHeaders();
            return await requestFn(newHeaders);
          }
        }
      } catch (refreshError) {
        console.warn('Token refresh failed:', refreshError);
      }
    }
    throw error;
  }
};

// Helper function to handle API errors with auth-specific handling
const handleApiError = async (response: Response, errorMessage: string) => {
  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    throw new Error('Authentication required. Please sign in again.');
  }
  
  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  try {
    const error = await response.json();
    throw new Error(error.message || errorMessage);
  } catch {
    throw new Error(errorMessage);
  }
};

// Real API functions for the YouTube Multilingual Dubber app

/**
 * Request signed upload URLs from the backend
 */
export const requestSignedUploadUrls = async (request: UploadUrlsRequest): Promise<SignedUploadUrls> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const url = `${API_BASE}/api/jobs/upload-urls`;
    
    console.log('📤 Requesting signed upload URLs:', {
      url,
      headers,
      body: request
    });
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    console.log('📥 Upload URLs response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    return await response.json();
  });
};

/**
 * Upload file directly to Supabase Storage using signed URL
 */
export const uploadFileToStorage = async (
  file: File,
  signedUrl: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        const speed = event.loaded / ((Date.now() - startTime) / 1000); // bytes per second
        const estimatedTime = (event.total - event.loaded) / speed; // seconds remaining
        
        onProgress({
          progress,
          status: 'uploading',
          message: 'Uploading file...',
          speed,
          estimatedTime,
          bytesUploaded: event.loaded,
          totalBytes: event.total
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.({
          progress: 100,
          status: 'complete',
          message: 'Upload complete',
          bytesUploaded: file.size,
          totalBytes: file.size
        });
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    const startTime = Date.now();
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
};

/**
 * Notify backend that file uploads are complete
 */
export const notifyUploadComplete = async (request: JobCreationRequest): Promise<SubmitJobResponse> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    
    console.log('📤 Creating job:', {
      url: `${API_BASE}/api/jobs/`,
      headers,
      body: request
    });
    
    const response = await fetch(`${API_BASE}/api/jobs/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    console.log('📥 Job creation response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Job creation error response:', errorData);
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    let jobData: unknown;
    try {
      jobData = await response.json();
      console.log('Job creation success response:', jobData);
    } catch (error) {
      console.error('Failed to parse job creation response:', error);
      throw new Error('Backend did not provide a valid JSON response');
    }

    // mapSubmitJobResponse will validate the data
    return mapSubmitJobResponse(jobData);
  });
};

/**
 * Complete dubbing job submission flow:
 * 1. Request signed upload URLs from backend
 * 2. Upload files directly to storage using signed URLs
 * 3. Notify backend that uploads are complete to trigger processing
 */
export const submitDubbingJob = async (
  data: DubbingJobData,
  onProgress?: (progress: UploadProgress) => void
): Promise<SubmitJobResponse> => {
  try {
    // 1) Request signed URLs for uploads
    onProgress?.({ progress: 5, status: 'uploading', message: 'Requesting upload URLs...' });

    // Backend UploadUrlsRequest schema expects: languages, voice_track_name, background_track_name
    const uploadUrls = await requestSignedUploadUrls({
      languages: data.targetLanguages,
      voice_track_name: data.voiceTrack.name,
      background_track_name: data.backgroundTrack?.name
    });

    // Extract upload URLs from response
    // Backend returns: { job_id: string, upload_urls: { voice_track: string, background_track?: string } }
    const voiceUploadUrl = uploadUrls.upload_urls.voice_track;
    const backgroundUploadUrl = uploadUrls.upload_urls.background_track;

    if (!voiceUploadUrl) {
      throw new Error('Backend did not provide voice track upload URL');
    }

    // 2) Upload files to storage
    onProgress?.({ progress: 15, status: 'uploading', message: 'Uploading voice track...' });
    await uploadFileToStorage(data.voiceTrack, voiceUploadUrl, (p) => onProgress?.(p));

    if (data.backgroundTrack && backgroundUploadUrl) {
      onProgress?.({ progress: 60, status: 'uploading', message: 'Uploading background track...' });
      await uploadFileToStorage(data.backgroundTrack, backgroundUploadUrl, (p) => onProgress?.(p));
    }

    // 3) Notify backend to create/process job
    // Backend JobCreationRequest expects: job_id, voice_track_uploaded, background_track_uploaded, languages, voice_track_url, background_track_url
    onProgress?.({ progress: 85, status: 'processing', message: 'Creating job...' });
    const result = await notifyUploadComplete({
      job_id: uploadUrls.job_id,
      voice_track_uploaded: true,
      background_track_uploaded: !!data.backgroundTrack,
      languages: data.targetLanguages,
      voice_track_url: uploadUrls.voice_track_path,
      background_track_url: uploadUrls.background_track_path,
    });

    onProgress?.({ progress: 100, status: 'complete', message: 'Job created successfully!' });
    return result;
  } catch (error) {
    console.error('Error submitting dubbing job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    onProgress?.({ progress: 0, status: 'error', message: errorMessage });
    throw error;
  }
};

// Jobs list APIs
export const fetchJobs = async (): Promise<Job[]> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/jobs`, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }
    const data = await response.json();

    // Validate response is an array
    if (!Array.isArray(data)) {
      throw createValidationError(
        'JobArray',
        data,
        'Invalid jobs data received from server'
      );
    }

    // Validate and map jobs
    const validJobs: Job[] = [];
    for (const item of data) {
      try {
        // mapJobSummary will validate the item
        validJobs.push(mapJobSummary(item));
      } catch (error) {
        console.warn('Invalid job data received, skipping:', item, error);
        // Skip invalid items rather than failing entire request
      }
    }

    return validJobs;
  });
};

export const deleteJob = async (jobId: string): Promise<void> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, { method: 'DELETE', headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }
  });
};

// Billing APIs
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  created_at: string;
  description?: string;
}

export const fetchTransactions = async (): Promise<Transaction[]> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/billing/transactions`, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }
    const data = await response.json();

    // Validate response is an array
    if (!Array.isArray(data)) {
      throw createValidationError(
        'TransactionArray',
        data,
        'Invalid transactions data received from server'
      );
    }

    // Validate and filter transactions
    const validTransactions: Transaction[] = [];
    for (const item of data) {
      if (isBackendTransaction(item)) {
        validTransactions.push(item as Transaction);
      } else {
        console.warn('Invalid transaction data received:', item);
        // Skip invalid items rather than failing entire request
      }
    }

    return validTransactions;
  });
};

export const createPaymentIntent = async (amount: number): Promise<{ clientSecret: string }> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/billing/create-payment-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }
    const data = await response.json();

    // Validate payment intent response
    if (!isBackendPaymentIntent(data)) {
      throw createValidationError(
        'BackendPaymentIntent',
        data,
        'Invalid payment intent response received from server'
      );
    }

    const clientSecret = data.client_secret || data.clientSecret;
    if (!clientSecret) {
      throw createValidationError(
        'BackendPaymentIntent',
        data,
        'Payment intent response missing client secret'
      );
    }

    return { clientSecret };
  });
};

export const getJobStatus = async (jobId: string, targetLanguages: string[] = []): Promise<GetJobStatusResponse> => {
  try {
    return await withRetry(async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError = createApiError(errorData, response);
        throw apiError;
      }

      const jobData = await response.json();

      // Debug: Log the raw job data received from backend
      console.log('🔍 Raw job data from backend:', JSON.stringify(jobData, null, 2));
      console.log('🔍 Job data type:', typeof jobData);
      console.log('🔍 Is array?', Array.isArray(jobData));

      // mapJobResponse will validate the data
      return mapJobResponse(jobData, { targetLanguages });
    });
  } catch (error) {
    // Fallback to mock status in development mode
    if (config.devMode) {
      const fallbackStatus = getMockJobStatus(jobId, targetLanguages);
      if (fallbackStatus) {
        return fallbackStatus;
      }
    }

    throw error;
  }
};

// Real job status polling with exponential backoff
export const pollJobStatus = (
  jobId: string,
  targetLanguages: string[],
  onProgress: (status: GetJobStatusResponse) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  let pollCount = 0;
  let isPolling = true;
  let timeoutId: NodeJS.Timeout | null = null;
  let consecutiveFailures = 0;

  const stopPolling = () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const scheduleNextPoll = (delay: number) => {
    if (!isPolling) return;
    timeoutId = setTimeout(poll, delay);
  };
  
  const poll = async () => {
    if (!isPolling) return;
    
    try {
      const status = await getJobStatus(jobId, targetLanguages);
      consecutiveFailures = 0;
      onProgress(status);
      
      // Check if job is complete or failed
      if (status.status === 'complete') {
        stopPolling();
        onComplete();
        return;
      }

      if (status.status === 'error') {
        stopPolling();
        const terminalError = new Error(status.message || 'Job failed');
        terminalError.name = 'JobError';
        Object.assign(terminalError, { terminal: true });
        onError(terminalError);
        return;
      }
      
      // Continue polling with exponential backoff
      pollCount++;
      const baseDelay = 2000; // 2 seconds base delay
      const maxDelay = 10000; // 10 seconds max delay
      const delay = Math.min(baseDelay * Math.pow(1.5, pollCount), maxDelay);
      
      scheduleNextPoll(delay);
      
    } catch (error) {
      console.error('Error polling job status:', error);
      consecutiveFailures++;

      const apiError = error as ApiError;
      const errorMessage = apiError?.message || 'Failed to fetch job status';
      const normalizedError = apiError instanceof Error
        ? apiError
        : Object.assign(new Error(errorMessage), { cause: apiError });
      const isNotFound = (apiError as ApiError)?.type === 'not_found' || (apiError as ApiError)?.statusCode === 404;
      const isNonRetryable = (apiError as ApiError)?.retryable === false;
      const hasExceededFailures = consecutiveFailures >= 3;

      const shouldStop = isNotFound || isNonRetryable || hasExceededFailures;
      if (shouldStop) {
        (normalizedError as Error & { cause?: unknown; terminal?: boolean }).name = 'TerminalPollError';
        Object.assign(normalizedError, { terminal: true });
      }

      onError(normalizedError);

      if (shouldStop) {
        stopPolling();
        return;
      }
      
      // Continue polling even on error, but with longer delay
      pollCount++;
      const baseDelay = 5000; // 5 seconds base delay for errors
      const maxDelay = 30000; // 30 seconds max delay for errors
      const delay = Math.min(baseDelay * Math.pow(1.5, pollCount), maxDelay);
      
      scheduleNextPoll(delay);
    }
  };
  
  // Start polling immediately
  poll();
  
  // Return cleanup function
  return () => {
    stopPolling();
  };
};

// Download system functions

/**
 * Download a file from a URL with progress tracking
 */
export const downloadFile = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      } else {
        reject(new Error(`Download failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Download failed due to network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Download was cancelled'));
    });

    xhr.open('GET', url);
    xhr.send();
  });
};

/**
 * Get download URL for a specific job, language, and file type
 */
export const getDownloadUrl = (
  jobId: string,
  languageCode: string,
  fileType: 'voice' | 'full' | 'captions'
): string => {
  const baseUrl = API_BASE_NORMALIZED;
  return `${baseUrl}/api/jobs/${jobId}/download?lang=${languageCode}&type=${fileType}`;
};

/**
 * Download multiple files in sequence
 */
export const downloadMultipleFiles = async (
  downloads: Array<{ url: string; filename: string }>,
  onProgress?: (completed: number, total: number) => void,
  onFileComplete?: (filename: string) => void
): Promise<void> => {
  const total = downloads.length;
  let completed = 0;

  for (const download of downloads) {
    try {
      await downloadFile(download.url, download.filename);
      completed++;
      onProgress?.(completed, total);
      onFileComplete?.(download.filename);
      
      // Small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${download.filename}:`, error);
      // Continue with next download even if one fails
    }
  }
};

// Downloads APIs
export const fetchDownloads = async (): Promise<{
  id: string;
  jobId: string;
  jobTitle: string;
  languageCode: string;
  languageName: string;
  fileType: 'voice' | 'full' | 'captions';
  fileName: string;
  fileSize?: number;
  downloadedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  downloadUrl?: string;
}[]> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/downloads`, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }
    const data = await response.json();

    // Validate response is an array
    if (!Array.isArray(data)) {
      throw createValidationError(
        'DownloadHistoryArray',
        data,
        'Invalid downloads data received from server'
      );
    }

    // Validate and map download items
    const validDownloads = [];
    for (const item of data) {
      if (!isDownloadHistoryItemApi(item)) {
        console.warn('Invalid download history item received:', item);
        // Skip invalid items rather than failing entire request
        continue;
      }

      validDownloads.push({
        id: item.id,
        jobId: item.job_id,
        jobTitle: item.job_title || 'Job',
        languageCode: item.language_code,
        languageName: item.language_name || item.language_code.toUpperCase(),
        fileType: item.file_type,
        fileName: item.file_name,
        fileSize: item.file_size,
        downloadedAt: item.downloaded_at,
        expiresAt: item.expires_at,
        isExpired: item.is_expired ?? (item.expires_at ? new Date(item.expires_at) < new Date() : false),
        downloadUrl: resolveDownloadUrl(item.download_url),
      });
    }

    return validDownloads;
  });
};

/**
 * Get download history from localStorage (in real app, this would be from API)
 */
export const getDownloadHistory = (): Array<{
  id: string;
  jobId: string;
  jobTitle: string;
  languageCode: string;
  languageName: string;
  fileType: 'voice' | 'full' | 'captions';
  fileName: string;
  fileSize?: number;
  downloadedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  downloadUrl?: string;
}> => {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem('yt-dubber-download-history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

/**
 * Add item to download history
 */
export const addToDownloadHistory = (item: {
  jobId: string;
  jobTitle: string;
  languageCode: string;
  languageName: string;
  fileType: 'voice' | 'full' | 'captions';
  fileName: string;
  fileSize?: number;
  downloadUrl?: string;
}): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getDownloadHistory();
    const newItem = {
      id: `${item.jobId}-${item.languageCode}-${item.fileType}-${Date.now()}`,
      ...item,
      downloadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      isExpired: false
    };
    
    history.unshift(newItem);
    
    // Keep only last 100 items
    if (history.length > 100) {
      history.splice(100);
    }
    
    localStorage.setItem('yt-dubber-download-history', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save download history:', error);
  }
};

/**
 * Remove item from download history
 */
export const removeFromDownloadHistory = (itemId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getDownloadHistory();
    const filtered = history.filter(item => item.id !== itemId);
    localStorage.setItem('yt-dubber-download-history', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from download history:', error);
  }
};

/**
 * Clear expired downloads from history
 */
export const clearExpiredDownloads = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const history = getDownloadHistory();
    const now = new Date();
    const filtered = history.filter(item => {
      if (!item.expiresAt) return true;
      return new Date(item.expiresAt) > now;
    });
    localStorage.setItem('yt-dubber-download-history', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to clear expired downloads:', error);
  }
};

// User Profile APIs

/**
 * User statistics interface matching backend UserStatsResponse schema
 */
export interface UserStats {
  totalJobs: number;
  completedJobs: number;
  processingJobs: number;
  failedJobs: number;
  totalLanguages: number;
  totalMinutesProcessed: number;
  accountAge: number;
  lastActivity?: string;
}

/**
 * User profile interface matching backend UserProfileResponse schema
 */
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone?: string;
  languagePreference?: string;
  createdAt: string;
  updatedAt?: string;
  creditBalance: number;
  stats: UserStats;
}

/**
 * User profile update request interface matching backend UserProfileUpdateRequest schema
 */
export interface UserProfileUpdate {
  fullName?: string;
  avatarUrl?: string;
  timezone?: string;
  languagePreference?: string;
}

/**
 * Type guard for UserProfile response
 */
const isUserProfile = (value: unknown): value is UserProfile => {
  if (!isRecord(value)) return false;

  const profile = value as Record<string, unknown>;
  return (
    typeof profile.id === 'string' &&
    typeof profile.email === 'string' &&
    typeof profile.createdAt === 'string' &&
    typeof profile.creditBalance === 'number' &&
    isRecord(profile.stats)
  );
};

/**
 * Type guard for UserStats response
 */
const isUserStats = (value: unknown): value is UserStats => {
  if (!isRecord(value)) return false;

  const stats = value as Record<string, unknown>;
  return (
    typeof stats.totalJobs === 'number' &&
    typeof stats.completedJobs === 'number' &&
    typeof stats.processingJobs === 'number' &&
    typeof stats.failedJobs === 'number' &&
    typeof stats.totalLanguages === 'number' &&
    typeof stats.totalMinutesProcessed === 'number' &&
    typeof stats.accountAge === 'number'
  );
};

/**
 * Fetch complete user profile with statistics
 * GET /api/users/me
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    const data = await response.json();

    // Validate response structure
    if (!isUserProfile(data)) {
      throw createValidationError(
        'UserProfile',
        data,
        'Invalid user profile data received from server'
      );
    }

    return data;
  });
};

/**
 * Update user profile
 * PUT /api/users/me
 */
export const updateUserProfile = async (updates: UserProfileUpdate): Promise<UserProfile> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    const data = await response.json();

    // Validate response structure
    if (!isUserProfile(data)) {
      throw createValidationError(
        'UserProfile',
        data,
        'Invalid user profile data received from server'
      );
    }

    return data;
  });
};

/**
 * Fetch user statistics only
 * GET /api/users/me/stats
 */
export const fetchUserStats = async (): Promise<UserStats> => {
  return withRetry(async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/users/me/stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    const data = await response.json();

    // Validate response structure
    if (!isUserStats(data)) {
      throw createValidationError(
        'UserStats',
        data,
        'Invalid user stats data received from server'
      );
    }

    return data;
  });
};

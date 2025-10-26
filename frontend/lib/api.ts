import { DubbingJobData, SubmitJobResponse, GetJobStatusResponse, LanguageProgress, LANGUAGES, SignedUploadUrls, UploadUrlsRequest, JobCreationRequest, UploadProgress, Job } from '@/types';

import { config } from './config';

// API configuration
const API_BASE = config.apiUrl;
const API_BASE_NORMALIZED = API_BASE.replace(/\/+$/, '');

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

interface BackendLanguageProgress {
  language_code: string;
  language_name?: string;
  flag?: string;
  status?: string;
  progress?: number;
  message?: string;
  estimated_time_remaining?: number;
  file_size?: number;
  download_url?: string;
}

type BackendJobDownloadUrls = Record<string, {
  voice?: string;
  full?: string;
  captions?: string;
} | undefined>;

interface BackendJobResponse {
  id?: string;
  job_id?: string;
  status?: string;
  progress?: number;
  message?: string;
  languages?: BackendLanguageProgress[];
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

interface BackendSubmitJobResponse {
  job_id?: string;
  id?: string;
}

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

const resolveDownloadUrl = (downloadUrl?: string): string | undefined => {
  if (!downloadUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(downloadUrl)) {
    return downloadUrl;
  }

  const trimmedPath = downloadUrl.replace(/^\/+/, '');
  return `${API_BASE_NORMALIZED}/${trimmedPath}`;
};

const mapDownloadUrls = (downloadUrls?: BackendJobDownloadUrls): Job['downloadUrls'] | undefined => {
  if (!downloadUrls) {
    return undefined;
  }

  const entries = Object.entries(downloadUrls).reduce<Record<string, { voice: string; full: string; captions?: string }>>((acc, [languageCode, urls]) => {
    if (!urls) {
      return acc;
    }

    const voiceUrl = resolveDownloadUrl(urls.voice);
    const fullUrl = resolveDownloadUrl(urls.full);

    if (!voiceUrl || !fullUrl) {
      return acc;
    }

    const mapped: { voice: string; full: string; captions?: string } = {
      voice: voiceUrl,
      full: fullUrl
    };

    const captionsUrl = resolveDownloadUrl(urls.captions);
    if (captionsUrl) {
      mapped.captions = captionsUrl;
    }

    acc[languageCode] = mapped;
    return acc;
  }, {});

  return Object.keys(entries).length > 0 ? entries : undefined;
};

export const mapLanguageProgress = (language: BackendLanguageProgress): LanguageProgress => {
  const status = isValidLanguageStatus(language.status) ? language.status : 'processing';
  const languageInfo = LANGUAGES.find(l => l.code === language.language_code);

  return {
    languageCode: language.language_code,
    languageName: language.language_name || languageInfo?.name || language.language_code,
    flag: languageInfo?.flag || language.flag || '🌐',
    status,
    progress: typeof language.progress === 'number' ? language.progress : 0,
    message: language.message || 'Processing...',
    estimatedTimeRemaining: language.estimated_time_remaining,
    fileSize: language.file_size,
    downloadUrl: resolveDownloadUrl(language.download_url)
  };
};

export const mapJobResponse = (job: BackendJobResponse, options: MapJobResponseOptions = {}): GetJobStatusResponse => {
  const id = job.id || job.job_id;

  if (!id) {
    throw new Error('Job response is missing an id field.');
  }

  const languages = job.languages?.map(mapLanguageProgress) || [];
  const completedLanguages = typeof job.completed_languages === 'number'
    ? job.completed_languages
    : languages.filter(language => language.status === 'complete').length;

  const totalLanguages = typeof job.total_languages === 'number'
    ? job.total_languages
    : (job.languages?.length || options.targetLanguages?.length || 0);

  const status = isValidJobStatus(job.status) ? job.status : 'processing';

  return {
    id,
    status,
    progress: typeof job.progress === 'number' ? job.progress : 0,
    message: job.message || 'Processing...',
    languages,
    totalLanguages,
    completedLanguages,
    startedAt: job.started_at || job.created_at || new Date().toISOString(),
    estimatedCompletion: job.estimated_completion
  };
};

export const mapJobSummary = (job: BackendJobResponse): Job => {
  const jobStatus = mapJobResponse(job, { targetLanguages: job.target_languages });

  // Map JobStatus status to Job status
  const mapStatus = (status: string): 'pending' | 'processing' | 'complete' | 'error' => {
    switch (status) {
      case 'uploading':
      case 'generating':
      case 'finalizing':
        return 'processing';
      case 'complete':
        return 'complete';
      case 'error':
        return 'error';
      default:
        return 'pending';
    }
  };

  return {
    id: jobStatus.id,
    status: mapStatus(jobStatus.status),
    progress: jobStatus.progress,
    message: jobStatus.message,
    createdAt: job.created_at || job.started_at || new Date().toISOString(),
    updatedAt: job.updated_at || job.created_at || job.started_at || new Date().toISOString(),
    voiceTrackDuration: job.voice_track_duration ?? 0,
    targetLanguages: job.target_languages || job.languages?.map(language => language.language_code) || [],
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

const mapSubmitJobResponse = (data: BackendSubmitJobResponse): SubmitJobResponse => {
  const jobId = data.job_id || data.id;

  if (!jobId) {
    throw new Error('Job submission response missing job_id field.');
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
      details: errorDetails,
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
            details: errorData,
            statusCode: 400,
            retryable: false
          };
        }
        return {
          type: 'validation',
          message: errorData.message || 'Invalid request data',
          details: errorData,
          statusCode: 400,
          retryable: false
        };
      case 401:
        return {
          type: 'auth',
          message: 'Authentication required - please sign in',
          details: errorData,
          statusCode: 401,
          retryable: false
        };
      case 403:
        return {
          type: 'auth',
          message: 'Access denied - insufficient permissions',
          details: errorData,
          statusCode: 403,
          retryable: false
        };
      case 404:
        return {
          type: 'not_found',
          message: 'Resource not found',
          details: errorData,
          statusCode: 404,
          retryable: false
        };
      case 429:
        return {
          type: 'rate_limit',
          message: 'Too many requests - please wait before trying again',
          details: errorData,
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
          details: errorData,
          statusCode: response.status,
          retryable: true
        };
      default:
        return {
          type: 'unknown',
          message: errorData.message || 'An unexpected error occurred',
          details: errorData,
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
          return headers;
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    // In development mode, use dev-token if no Supabase session exists
    if (config.devMode) {
      headers['Authorization'] = 'Bearer dev-token';
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
    const response = await fetch(`${API_BASE}/api/jobs/upload-urls`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
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
    
    console.log('Sending job creation request:', {
      url: `${API_BASE}/api/jobs`,
      headers,
      body: request
    });
    
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    console.log('Job creation response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Job creation error response:', errorData);
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    let jobData: BackendSubmitJobResponse;
    try {
      jobData = await response.json();
      console.log('Job creation success response:', jobData);
    } catch (error) {
      console.error('Failed to parse job creation response:', error);
      throw new Error('Backend did not provide a valid JSON response');
    }

    return mapSubmitJobResponse(jobData);
  });
};

export const submitDubbingJob = async (
  data: DubbingJobData,
  onProgress?: (progress: UploadProgress) => void
): Promise<SubmitJobResponse> => {
  try {
    // Step 1: Request signed upload URLs from backend
    onProgress?.({
      progress: 0,
      status: 'processing',
      message: 'Requesting upload URLs...'
    });

    const signedUrls = await requestSignedUploadUrls({
      languages: data.targetLanguages,
      voice_track_name: data.voiceTrack.name,
      background_track_name: data.backgroundTrack?.name,
    });

    // Step 2: Upload voice track directly to Supabase Storage
    onProgress?.({
      progress: 10,
      status: 'uploading',
      message: 'Uploading voice track...'
    });

    await uploadFileToStorage(data.voiceTrack, signedUrls.upload_urls.voice_track, (progress) => {
      onProgress?.({
        ...progress,
        message: 'Uploading voice track...'
      });
    });

    // Step 3: Upload background track if provided
    if (data.backgroundTrack && signedUrls.upload_urls.background_track) {
      onProgress?.({
        progress: 50,
        status: 'uploading',
        message: 'Uploading background track...'
      });

      await uploadFileToStorage(data.backgroundTrack, signedUrls.upload_urls.background_track, (progress) => {
        onProgress?.({
          ...progress,
          message: 'Uploading background track...'
        });
      });
    }

    // Step 4: Notify backend that uploads are complete
    onProgress?.({
      progress: 90,
      status: 'processing',
      message: 'Finalizing job...'
    });

    const result = await notifyUploadComplete({
      job_id: signedUrls.job_id,
      voice_track_uploaded: true,
      background_track_uploaded: !!data.backgroundTrack,
      languages: data.targetLanguages,
    });

    onProgress?.({
      progress: 100,
      status: 'complete',
      message: 'Job created successfully!'
    });

    return result;

  } catch (error) {
    console.error('Error submitting dubbing job:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Upload failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      // Handle API errors
      const apiError = error as any;
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.type) {
        errorMessage = `API Error: ${apiError.type}`;
      }
    }
    
    onProgress?.({
      progress: 0,
      status: 'error',
      message: errorMessage
    });
    throw error;
  }
};

export const getJobStatus = async (jobId: string, targetLanguages: string[] = []): Promise<GetJobStatusResponse> => {
  const mockStatus = config.devMode ? getMockJobStatus(jobId, targetLanguages) : null;
  if (mockStatus) {
    return mockStatus;
  }

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

      const jobData: BackendJobResponse = await response.json();
      return mapJobResponse(jobData, { targetLanguages });
    });
  } catch (error) {
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

import { DubbingJobData, SubmitJobResponse, GetJobStatusResponse, LanguageProgress, LANGUAGES, SignedUploadUrls, UploadUrlsRequest, JobCreationRequest, UploadProgress } from '@/types';

import { config } from './config';

// API configuration
const API_BASE = config.apiUrl;

// Error types for better error handling
export interface ApiError {
  type: 'network' | 'validation' | 'server' | 'auth' | 'not_found' | 'rate_limit' | 'unknown';
  message: string;
  details?: any;
  statusCode?: number;
  retryable?: boolean;
}

export interface BackendErrorResponse {
  error: string;
  message: string;
  details?: any;
  voice_duration?: number;
  background_duration?: number;
  status_code?: number;
}

// Error handling utilities
export const createApiError = (error: any, response?: Response): ApiError => {
  // Network errors
  if (!response) {
    return {
      type: 'network',
      message: 'Network error - please check your connection',
      details: error.message,
      retryable: true
    };
  }

  // Parse backend error response
  if (response.headers.get('content-type')?.includes('application/json')) {
    try {
      const errorData: BackendErrorResponse = error;
      
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
    } catch (parseError) {
      // If we can't parse the error response, fall back to generic error
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
  let lastError: any;
  
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
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
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
    const response = await fetch(`${API_BASE}/api/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError = createApiError(errorData, response);
      throw apiError;
    }

    const jobData = await response.json();
    return { jobId: jobData.job_id };
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
    onProgress?.({
      progress: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Upload failed'
    });
    throw error;
  }
};

export const getJobStatus = async (jobId: string, targetLanguages: string[] = []): Promise<GetJobStatusResponse> => {
  return withRetry(async () => {
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
    
    // Transform backend response to frontend format
    const languages: LanguageProgress[] = jobData.languages?.map((lang: any) => {
      const languageInfo = LANGUAGES.find(l => l.code === lang.language_code);
      return {
        languageCode: lang.language_code,
        languageName: languageInfo?.name || lang.language_name,
        flag: languageInfo?.flag || '🌐',
        status: lang.status,
        progress: lang.progress || 0,
        message: lang.message || 'Processing...',
        estimatedTimeRemaining: lang.estimated_time_remaining,
        fileSize: lang.file_size,
        downloadUrl: lang.download_url ? `${API_BASE}${lang.download_url}` : undefined
      };
    }) || [];

    return {
      id: jobData.id,
      status: jobData.status,
      progress: jobData.progress || 0,
      message: jobData.message || 'Processing...',
      languages,
      totalLanguages: jobData.total_languages || targetLanguages.length,
      completedLanguages: jobData.completed_languages || 0,
      startedAt: jobData.started_at || new Date().toISOString(),
      estimatedCompletion: jobData.estimated_completion
    };
  });
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
  
  const poll = async () => {
    if (!isPolling) return;
    
    try {
      const status = await getJobStatus(jobId, targetLanguages);
      onProgress(status);
      
      // Check if job is complete or failed
      if (status.status === 'complete' || status.status === 'error') {
        isPolling = false;
        if (status.status === 'complete') {
          onComplete();
        }
        return;
      }
      
      // Continue polling with exponential backoff
      pollCount++;
      const baseDelay = 2000; // 2 seconds base delay
      const maxDelay = 10000; // 10 seconds max delay
      const delay = Math.min(baseDelay * Math.pow(1.5, pollCount), maxDelay);
      
      timeoutId = setTimeout(poll, delay);
      
    } catch (error) {
      console.error('Error polling job status:', error);
      onError(error as Error);
      
      // Continue polling even on error, but with longer delay
      pollCount++;
      const baseDelay = 5000; // 5 seconds base delay for errors
      const maxDelay = 30000; // 30 seconds max delay for errors
      const delay = Math.min(baseDelay * Math.pow(1.5, pollCount), maxDelay);
      
      timeoutId = setTimeout(poll, delay);
    }
  };
  
  // Start polling immediately
  poll();
  
  // Return cleanup function
  return () => {
    isPolling = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};
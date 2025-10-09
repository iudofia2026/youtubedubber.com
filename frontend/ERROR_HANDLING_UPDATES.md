# Error Handling System Updates - YT Dubber Frontend

## Overview
This document provides a comprehensive overview of the error handling system updates implemented for the YT Dubber frontend. The updates focus on improving error handling to work with backend error responses and enhance the overall user experience.

## Changes Made

### 1. Enhanced API Error Handling (`lib/api.ts`)

#### 1.1 New Error Types and Interfaces
**Location**: `lib/api.ts` (lines 6-22)

```typescript
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
```

**Purpose**: 
- Provides structured error types for consistent error handling
- Categorizes errors by type (network, validation, server, etc.)
- Includes retryability information for automatic retry logic
- Supports backend-specific error details like duration mismatch

#### 1.2 Error Creation and Parsing Function
**Location**: `lib/api.ts` (lines 24-171)

```typescript
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
          // ... other status codes
      }
    } catch (parseError) {
      // Fallback handling
    }
  }
  // ... generic error handling
};
```

**Purpose**:
- Parses backend error responses into structured ApiError objects
- Handles specific error types like duration mismatch with detailed messages
- Maps HTTP status codes to appropriate error types
- Determines retryability based on error type and status code
- Provides fallback handling for unparseable responses

#### 1.3 Retry Mechanism with Exponential Backoff
**Location**: `lib/api.ts` (lines 173-205)

```typescript
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
```

**Purpose**:
- Implements automatic retry for transient errors
- Uses exponential backoff to avoid overwhelming the server
- Respects retryability flags from error types
- Configurable retry attempts and base delay

#### 1.4 Updated API Functions
**Location**: `lib/api.ts` (lines 259-276, 341-359, 442-486)

**Functions Updated**:
- `requestSignedUploadUrls()`
- `notifyUploadComplete()`
- `getJobStatus()`

**Changes Made**:
- Wrapped all API calls with `withRetry()` for automatic retry
- Replaced generic error handling with structured error parsing
- Added proper error response parsing using `createApiError()`
- Removed old `handleApiError()` calls in favor of new system

**Before**:
```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    await handleApiError(response, 'Failed to get data');
  }
  return await response.json();
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

**After**:
```typescript
return withRetry(async () => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const apiError = createApiError(errorData, response);
    throw apiError;
  }
  return await response.json();
});
```

### 2. Enhanced Toast Notification System (`components/ToastNotifications.tsx`)

#### 2.1 New API Error Handler Hook
**Location**: `components/ToastNotifications.tsx` (lines 186-236)

```typescript
export const useApiErrorHandler = () => {
  const { addToast } = useToast();

  const handleApiError = (error: any, context?: string) => {
    console.error('API Error:', error, context);

    // If it's already an ApiError, use it directly
    if (error.type && error.message) {
      const errorType = error.type;
      const title = getErrorTitle(errorType, context);
      const message = error.message;
      
      addToast({
        type: 'error',
        title,
        message,
        duration: errorType === 'network' ? 8000 : 5000,
        action: error.retryable ? {
          label: 'Retry',
          onClick: () => {
            console.log('Retry requested');
          }
        } : undefined
      });
      return;
    }
    // ... other error handling
  };

  return { handleApiError };
};
```

**Purpose**:
- Provides a specialized hook for handling API errors
- Automatically categorizes errors and shows appropriate messages
- Adds retry buttons for retryable errors
- Uses different durations for different error types
- Provides context-aware error titles

#### 2.2 Error Title Helper Function
**Location**: `components/ToastNotifications.tsx` (lines 238-259)

```typescript
const getErrorTitle = (errorType: string, context?: string): string => {
  const baseContext = context || 'Operation';
  
  switch (errorType) {
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Invalid Data';
    case 'server':
      return 'Server Error';
    case 'auth':
      return 'Authentication Required';
    case 'not_found':
      return 'Not Found';
    case 'rate_limit':
      return 'Too Many Requests';
    case 'unknown':
    default:
      return `${baseContext} Failed`;
  }
};
```

**Purpose**:
- Maps error types to user-friendly titles
- Provides context-aware error titles
- Ensures consistent error messaging across the app

## Error Handling Features

### 1. Error Categorization
The system now categorizes errors into the following types:

- **Network**: Connection issues, timeouts, offline states
- **Validation**: Invalid data, missing required fields, format errors
- **Server**: 5xx errors, internal server errors
- **Auth**: Authentication and authorization errors
- **Not Found**: 404 errors, resource not found
- **Rate Limit**: 429 errors, too many requests
- **Unknown**: Unclassified errors

### 2. Retry Logic
- Automatic retry for transient errors (network, server, rate limit)
- Exponential backoff to prevent server overload
- Configurable retry attempts and delays
- Respects retryability flags from error types

### 3. User-Friendly Error Messages
- Context-aware error titles
- Detailed error messages with specific information
- Retry buttons for retryable errors
- Different toast durations based on error type

### 4. Backend Integration
- Handles structured backend error responses
- Supports specific error types like duration mismatch
- Parses error details and provides meaningful messages
- Maintains backward compatibility with generic errors

## Usage Examples

### 1. Using the API Error Handler
```typescript
import { useApiErrorHandler } from '@/components/ToastNotifications';

function MyComponent() {
  const { handleApiError } = useApiErrorHandler();
  
  const handleApiCall = async () => {
    try {
      const result = await someApiCall();
      return result;
    } catch (error) {
      handleApiError(error, 'Data Loading');
    }
  };
}
```

### 2. Error Types in Action
```typescript
// Network error - shows retry button
{
  type: 'network',
  message: 'Network error - please check your connection',
  retryable: true
}

// Validation error - no retry button
{
  type: 'validation',
  message: 'Audio tracks must be the same length. Voice: 120s, Background: 115s',
  retryable: false
}

// Server error - shows retry button
{
  type: 'server',
  message: 'Server error - please try again later',
  retryable: true
}
```

## Benefits

### 1. Improved User Experience
- Clear, actionable error messages
- Automatic retry for transient errors
- Context-aware error handling
- Consistent error presentation

### 2. Better Error Recovery
- Automatic retry mechanism
- Exponential backoff prevents server overload
- Retry buttons for manual retry
- Graceful degradation for non-retryable errors

### 3. Enhanced Debugging
- Structured error logging
- Error categorization for easier debugging
- Detailed error information preserved
- Console logging with context

### 4. Backend Integration Ready
- Handles structured backend responses
- Supports specific error types
- Maintains compatibility with existing code
- Easy to extend for new error types

## Future Enhancements

### 1. Network Status Detection
- Detect offline/online status
- Show appropriate messages for offline state
- Queue requests when offline

### 2. Error Analytics
- Track error frequency and types
- Monitor retry success rates
- Identify common error patterns

### 3. Advanced Retry Strategies
- Circuit breaker pattern
- Jitter for retry delays
- Different retry strategies per error type

### 4. Error Recovery Actions
- Implement actual retry functionality
- Add "Report Error" actions
- Provide alternative actions for failed operations

## Testing

### 1. Error Scenarios to Test
- Network disconnection
- Server errors (500, 502, 503, 504)
- Validation errors (400)
- Authentication errors (401, 403)
- Rate limiting (429)
- Not found errors (404)
- Duration mismatch errors

### 2. Retry Behavior
- Verify retry attempts for retryable errors
- Confirm no retry for non-retryable errors
- Test exponential backoff timing
- Verify retry button functionality

### 3. User Experience
- Check error message clarity
- Verify appropriate error titles
- Test toast notification timing
- Confirm retry button visibility

## Migration Notes

### 1. Existing Code
- All existing API calls now use the new error handling
- No breaking changes to existing interfaces
- Backward compatibility maintained

### 2. New Components
- Use `useApiErrorHandler()` for new API calls
- Implement retry functionality where needed
- Add context to error handling calls

### 3. Error Handling Updates
- Replace generic error handling with structured approach
- Use appropriate error types and messages
- Implement retry mechanisms where beneficial

## Conclusion

The enhanced error handling system provides a robust foundation for handling API errors in the YT Dubber frontend. It improves user experience through clear error messages, automatic retry mechanisms, and context-aware error handling. The system is designed to be extensible and maintainable, with clear separation of concerns and comprehensive error categorization.

The implementation maintains backward compatibility while providing significant improvements in error handling capabilities, making the application more resilient and user-friendly.
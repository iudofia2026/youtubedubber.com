# File Upload System Backend Integration Changes

## Overview
Updated the YT Dubber frontend file upload system to work with the backend's direct upload architecture using Supabase Storage signed URLs.

## Files Modified

### 1. `types/index.ts` - Type Definitions

#### Added New Types:
```typescript
// Enhanced FileUploadProps with upload progress tracking
export interface FileUploadProps {
  // ... existing props ...
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: string) => void;
  isUploading?: boolean;
  uploadProgress?: UploadProgress;
}

// New upload progress tracking type
export interface UploadProgress {
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'validating' | 'complete' | 'error';
  message: string;
  speed?: number; // bytes per second
  estimatedTime?: number; // seconds remaining
  bytesUploaded?: number;
  totalBytes?: number;
}

// Backend API types for signed URL flow
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
```

### 2. `lib/api.ts` - API Functions

#### Added New API Functions:
```typescript
// Request signed upload URLs from backend
export const requestSignedUploadUrls = async (request: UploadUrlsRequest): Promise<SignedUploadUrls>

// Upload file directly to Supabase Storage using signed URL with progress tracking
export const uploadFileToStorage = async (
  file: File,
  signedUrl: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void>

// Notify backend that file uploads are complete
export const notifyUploadComplete = async (request: JobCreationRequest): Promise<SubmitJobResponse>
```

#### Modified Existing Function:
```typescript
// Updated submitDubbingJob to use direct upload flow with progress tracking
export const submitDubbingJob = async (
  data: DubbingJobData,
  onProgress?: (progress: UploadProgress) => void
): Promise<SubmitJobResponse>
```

**Key Changes:**
- Replaced mock implementation with real backend integration
- Added progress tracking using XMLHttpRequest for native browser upload events
- Implemented 4-step process: request URLs → upload voice → upload background → notify backend
- Added comprehensive error handling for duration mismatches and network failures

### 3. `components/LoadingStates.tsx` - Upload Progress Component

#### Enhanced UploadProgress Component:
```typescript
interface UploadProgressProps {
  progress: number;
  fileName: string;
  status: 'uploading' | 'processing' | 'validating' | 'complete' | 'error';
  message?: string;
  speed?: number;
  estimatedTime?: number;
  bytesUploaded?: number;
  totalBytes?: number;
}
```

**Key Changes:**
- Added support for real-time upload progress display
- Added speed and estimated time remaining calculations
- Added bytes uploaded/total bytes display
- Enhanced status icons for complete/error states
- Added color-coded progress bars (green for complete, red for error)

### 4. `components/FileUpload.tsx` - File Upload Component

#### Modified Props Interface:
```typescript
export function FileUpload({ 
  // ... existing props ...
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  isUploading = false,
  uploadProgress
}: FileUploadProps)
```

#### Updated handleFileSelect Function:
```typescript
const handleFileSelect = async (file: File) => {
  // ... validation logic ...
  
  try {
    // Notify parent component about upload start
    onUploadProgress?.({
      progress: 0,
      status: 'validating',
      message: 'Validating file...'
    });

    // Get audio duration for validation
    const audioInfo = await getAudioDuration(file);
    
    // Notify parent component about validation complete
    onUploadProgress?.({
      progress: 100,
      status: 'complete',
      message: 'File validated successfully'
    });
    
    // Call parent callbacks
    onFileSelect(file);
    onDurationChange?.(audioInfo.duration);
    onUploadComplete?.(file);
    
  } catch (error) {
    // ... error handling ...
    onUploadError?.(errorMessage);
  }
};
```

**Key Changes:**
- Removed local upload state management (now handled by parent)
- Added progress callback integration
- Simplified to focus on file validation only
- Added proper error handling with parent callbacks
- Updated progress display to use props instead of local state

### 5. `components/JobCreationWizard.tsx` - Upload Wizard

#### Updated Interface and State:
```typescript
interface JobCreationWizardProps {
  onSubmit: (data: { voiceTrack: File; backgroundTrack?: File; targetLanguages: string[] }) => void;
}

// Updated form data structure
const [formData, setFormData] = useState({
  voiceTrack: null as File | null,
  backgroundTrack: null as File | null,
  targetLanguages: [] as string[], // Changed from single language to array
  voiceTrackDuration: null as number | null,
  backgroundTrackDuration: null as number | null,
});

// Added upload progress tracking
const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
```

#### Updated handleSubmit Function:
```typescript
const handleSubmit = async () => {
  // ... validation ...
  
  setIsSubmitting(true);
  setUploadProgress({
    progress: 0,
    status: 'processing',
    message: 'Starting upload process...'
  });
  
  try {
    const result = await submitDubbingJob({
      voiceTrack: formData.voiceTrack,
      backgroundTrack: formData.backgroundTrack || undefined,
      targetLanguages: formData.targetLanguages
    }, (progress) => {
      setUploadProgress(progress);
    });
    
    // ... success handling ...
    
  } catch (error) {
    // ... error handling with progress updates ...
  }
};
```

**Key Changes:**
- Changed from single language to multiple languages support
- Added upload progress tracking state
- Integrated with new submitDubbingJob API function
- Added real-time progress updates during upload
- Enhanced error handling with progress feedback

#### Updated Step 3 (Language Selection):
```typescript
// Changed from LanguageSelect to LanguageChecklist for multiple selection
{currentStep === 3 && (
  <div className="space-y-6">
    <LanguageChecklist
      value={formData.targetLanguages}
      onChange={(languages) => setFormData(prev => ({ ...prev, targetLanguages: languages }))}
      languages={LANGUAGES}
    />
    // ... rest of step content ...
  </div>
)}
```

## Backend Integration Flow

### 1. Direct Upload Process:
```
1. User selects files → File validation (client-side)
2. Request signed URLs → POST /api/jobs/upload-urls
3. Upload voice track → Direct to Supabase Storage
4. Upload background track → Direct to Supabase Storage (if provided)
5. Notify backend → POST /api/jobs (with file metadata)
6. Backend validates duration matching
7. Job created and queued for processing
```

### 2. Progress Tracking:
- **File Validation**: Client-side duration extraction and validation
- **URL Request**: Backend API call for signed URLs
- **File Upload**: Real-time progress using XMLHttpRequest events
- **Backend Notification**: Final job creation step

### 3. Error Handling:
- **Duration Mismatch**: Backend validation with specific error messages
- **Upload Failures**: Network error handling with retry options
- **File Validation**: Client-side validation with user feedback
- **API Errors**: Comprehensive error messages from backend

## Key Benefits

1. **Real-time Progress**: Native browser upload progress tracking
2. **Direct Upload**: Files go directly to Supabase Storage (no backend bottleneck)
3. **Better UX**: Detailed progress information with speed and time estimates
4. **Error Recovery**: Comprehensive error handling with user-friendly messages
5. **Scalability**: Direct upload reduces backend load
6. **Multiple Languages**: Support for multiple target languages per job

## Backward Compatibility

- All existing props and interfaces maintained
- Graceful fallback for missing progress callbacks
- Existing validation logic preserved
- No breaking changes to parent components

## Testing Considerations

- Test with various file sizes and types
- Test upload progress accuracy
- Test error handling scenarios
- Test duration mismatch validation
- Test multiple language selection
- Test network failure recovery

## Summary of Changes

### ✅ Completed Tasks:
1. **Type Definitions** - Added comprehensive types for upload progress and backend integration
2. **API Functions** - Implemented real backend integration with signed URL flow
3. **Upload Progress UI** - Enhanced progress component with real-time tracking
4. **FileUpload Component** - Updated to support new upload flow with progress callbacks
5. **JobCreationWizard** - Modified to handle direct upload process with multiple languages
6. **File Validation** - Updated to work with backend requirements while maintaining UX

### 🔄 Integration Flow:
```
Client File Selection → Validation → Request Signed URLs → Direct Upload to Supabase → Notify Backend → Job Creation
```

### 🎯 Key Features Added:
- Real-time upload progress with speed and time estimates
- Direct Supabase Storage upload (no backend bottleneck)
- Multiple language support per job
- Comprehensive error handling
- Duration mismatch validation
- Network failure recovery

### 📁 Files Modified:
- `types/index.ts` - Added new type definitions
- `lib/api.ts` - Implemented backend integration functions
- `components/LoadingStates.tsx` - Enhanced upload progress component
- `components/FileUpload.tsx` - Updated for new upload flow
- `components/JobCreationWizard.tsx` - Modified for direct upload process

### 🚀 Ready for Backend Integration:
The frontend is now fully prepared to work with the backend's direct upload architecture. All mock functions have been replaced with real API calls, and the upload system supports the complete flow from file selection to job creation.
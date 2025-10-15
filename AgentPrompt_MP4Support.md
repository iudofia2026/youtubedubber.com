# Agent Task: Implement MP4 Video Format Support

## 📋 TASK: Complete MP4 Video Support Implementation

### 🎯 Objective
Implement full MP4 video format support for direct video upload and audio extraction with maximum precision and comprehensive documentation updates.

### 📚 First Steps - Read Documentation
1. **Read main README.md** - understand project structure and current status
2. **Read frontend/README.md** - understand frontend architecture and completed features
3. **Read backend/README.md** - understand backend architecture and API endpoints
4. **Read IsiahCurrentSprint.md** - understand current sprint status and MP4 priority
5. **Check current branch**: `isiah-frontend-oct15` (default branch)
6. **Review existing audio support**: Look at current audio format handling

### 🔍 Current State Analysis
- **Backend**: Currently supports `audio/mpeg,audio/wav,audio/mp3,audio/m4a` only
- **Frontend**: File upload accepts `audio/*` but needs video support
- **AI Service**: Has MP4 in validation but not in config
- **FFmpeg**: Already supports MP4 audio extraction
- **Documentation**: Partially updated but needs completion

### 🎯 Implementation Requirements

#### 1. Backend Configuration Updates
- **File**: `backend/app/config.py`
  - Add `video/mp4` to `allowed_audio_types` string
  - Update `get_allowed_audio_types()` method if needed
- **Files**: `backend/.env.example`, `backend/.env.staging`, `backend/.env.production`
  - Add `video/mp4` to `ALLOWED_AUDIO_TYPES` environment variable
- **File**: `backend/app/services/ai_service.py`
  - Ensure MP4 is properly handled in `validate_audio_file()` method
  - Update file extension validation to include `.mp4`

#### 2. Frontend Upload Support
- **File**: `frontend/components/FileUpload.tsx`
  - Update `accept` attribute to include `video/mp4`
  - Add video file validation and error handling
- **File**: `frontend/app/new/page.tsx`
  - Update file upload components to accept video files
  - Add video-specific upload instructions
- **File**: `frontend/components/JobCreationWizard.tsx`
  - Update file upload to handle video files
  - Add video format validation

#### 3. User Interface Updates
- **File**: `frontend/app/help/page.tsx`
  - Update FAQ to reflect MP4 support
  - Add video upload instructions
  - Update supported formats list
- **File**: `frontend/app/how-it-works/page.tsx`
  - Update instructions to mention video upload option
  - Add video processing workflow explanation
- **File**: `frontend/app/page.tsx`
  - Update homepage to mention video support
  - Add video upload to feature descriptions

#### 4. Backend Processing Updates
- **File**: `backend/app/services/ai_service.py`
  - Update `process_audio_file()` to handle video files
  - Add video-to-audio extraction using FFmpeg
  - Ensure proper error handling for video processing
- **File**: `backend/app/worker/processor.py`
  - Update worker to handle video file processing
  - Add video file validation and processing logic

#### 5. Documentation Updates
- **File**: `README.md`
  - Add MP4 support to features list
  - Update supported formats section
- **File**: `frontend/README.md`
  - Add MP4 support to frontend features
  - Update upload capabilities section
- **File**: `backend/README.md`
  - Add MP4 support to backend capabilities
  - Update API documentation for video support
- **File**: `IsiahCurrentSprint.md`
  - Mark MP4 support as COMPLETED
  - Update sprint status

### 🎨 Design Requirements
- **Consistent Messaging**: All UI text should clearly indicate video support
- **User Experience**: Seamless transition between audio and video uploads
- **Error Handling**: Clear error messages for unsupported video formats
- **Visual Indicators**: Icons and labels should reflect video capability
- **Mobile Support**: Ensure video upload works on mobile devices

### 🔧 Technical Implementation Details

#### Backend Changes:
```python
# config.py
allowed_audio_types: str = "audio/mpeg,audio/wav,audio/mp3,audio/m4a,video/mp4"

# ai_service.py - Add video processing
async def extract_audio_from_video(self, video_file_path: str) -> str:
    """Extract audio from MP4 video file using FFmpeg"""
    # Implementation using ffmpeg to extract audio
```

#### Frontend Changes:
```tsx
// FileUpload.tsx
accept="audio/*,video/mp4"

// Add video file validation
const isVideoFile = (file: File) => file.type === 'video/mp4';
```

### 📱 User Experience Requirements
- **Upload Flow**: Users can drag/drop MP4 files or select from file picker
- **Processing**: Clear indication when video is being processed
- **Instructions**: Updated guidance for video vs audio uploads
- **Error Messages**: Specific error handling for video format issues
- **Progress**: Video processing progress indicators

### 🧪 Testing Requirements
- **Backend**: Test MP4 file upload and processing
- **Frontend**: Test video file selection and upload
- **Integration**: Test complete video-to-audio workflow
- **Error Handling**: Test unsupported video formats
- **Mobile**: Test video upload on mobile devices
- **Performance**: Test with various MP4 file sizes

### 📁 Files to Create/Modify
**Backend:**
- `app/config.py` (modify)
- `app/services/ai_service.py` (modify)
- `app/worker/processor.py` (modify)
- `.env.example` (modify)
- `.env.staging` (modify)
- `.env.production` (modify)

**Frontend:**
- `components/FileUpload.tsx` (modify)
- `app/new/page.tsx` (modify)
- `components/JobCreationWizard.tsx` (modify)
- `app/help/page.tsx` (modify)
- `app/how-it-works/page.tsx` (modify)
- `app/page.tsx` (modify)

**Documentation:**
- `README.md` (modify)
- `frontend/README.md` (modify)
- `backend/README.md` (modify)
- `IsiahCurrentSprint.md` (modify)

### 🚀 Success Criteria
- ✅ MP4 files can be uploaded through frontend
- ✅ Backend processes MP4 files and extracts audio
- ✅ All documentation reflects MP4 support
- ✅ User interface clearly indicates video support
- ✅ Error handling works for unsupported video formats
- ✅ Mobile video upload works properly
- ✅ Complete video-to-audio workflow functions
- ✅ All changes pushed to both main and isiah-frontend-oct15 branches

### 💡 Implementation Tips
- **Start with backend config** - ensure MP4 is accepted at API level
- **Test FFmpeg integration** - verify video-to-audio extraction works
- **Update frontend gradually** - start with file upload, then UI text
- **Document as you go** - update docs immediately after each change
- **Test thoroughly** - verify complete workflow end-to-end
- **Consider file size limits** - video files may be larger than audio
- **Add proper error messages** - users need clear feedback

### 🔄 Git Workflow
1. **Create feature branch**: `git checkout -b feature/mp4-video-support`
2. **Implement changes**: Backend → Frontend → Documentation
3. **Test thoroughly**: All functionality working
4. **Commit frequently**: Small, logical commits
5. **Push to isiah-frontend-oct15**: `git push origin isiah-frontend-oct15`
6. **Merge to main**: `git checkout main && git merge isiah-frontend-oct15`
7. **Push to main**: `git push origin main`

**This is the #1 HIGH PRIORITY backlog item. Implement with maximum precision and attention to detail.**
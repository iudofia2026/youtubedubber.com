// Core types for the YouTube Multilingual Dubber app

export interface FileUploadProps {
  label: string;
  required?: boolean;
  accept: string;
  maxSize: number; // in MB
  onFileSelect: (file: File) => void;
  onDurationChange?: (duration: number) => void;
  error?: string;
  value?: File | null;
  duration?: number | null;
  durationFormatted?: string;
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

export interface JobStatus {
  id: string;
  status: 'uploading' | 'processing' | 'generating' | 'finalizing' | 'complete';
  progress: number;
  message: string;
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
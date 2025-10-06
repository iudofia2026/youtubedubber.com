import { DubbingJobData, JobStatus, SubmitJobResponse, GetJobStatusResponse, LanguageProgress, LANGUAGES } from '@/types';

// Mock API functions for the YouTube Multilingual Dubber app

export const submitDubbingJob = async (data: DubbingJobData): Promise<SubmitJobResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate random job ID
  const jobId = Math.random().toString(36).substr(2, 9);
  
  return { jobId };
};

export const getJobStatus = async (jobId: string, targetLanguages: string[] = []): Promise<GetJobStatusResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock job status - in a real app, this would fetch from the server
  const statuses: JobStatus['status'][] = ['uploading', 'processing', 'generating', 'finalizing', 'complete'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  let progress = 0;
  let message = '';
  
  switch (randomStatus) {
    case 'uploading':
      progress = Math.floor(Math.random() * 30) + 10;
      message = 'Uploading files...';
      break;
    case 'processing':
      progress = Math.floor(Math.random() * 30) + 30;
      message = 'Processing audio...';
      break;
    case 'generating':
      progress = Math.floor(Math.random() * 30) + 60;
      message = 'Generating dubs...';
      break;
    case 'finalizing':
      progress = Math.floor(Math.random() * 15) + 85;
      message = 'Finalizing...';
      break;
    case 'complete':
      progress = 100;
      message = 'Complete!';
      break;
  }

  // Generate individual language progress
  const languages: LanguageProgress[] = targetLanguages.map((langCode, index) => {
    const lang = LANGUAGES.find(l => l.code === langCode);
    if (!lang) return null;

    // Simulate different progress for each language
    const languageProgress = Math.min(100, Math.max(0, progress + (Math.random() - 0.5) * 20));
    const languageStatus: LanguageProgress['status'] = 
      languageProgress >= 100 ? 'complete' :
      languageProgress >= 80 ? 'finalizing' :
      languageProgress >= 60 ? 'generating' :
      languageProgress >= 30 ? 'processing' : 'pending';

    const messages = {
      pending: 'Waiting to start...',
      processing: 'Processing audio...',
      generating: 'Generating voice...',
      finalizing: 'Finalizing output...',
      complete: 'Ready for download',
      error: 'Processing failed'
    };

    return {
      languageCode: lang.code,
      languageName: lang.name,
      flag: lang.flag,
      status: languageStatus,
      progress: Math.round(languageProgress),
      message: messages[languageStatus],
      estimatedTimeRemaining: languageStatus !== 'complete' ? Math.random() * 120 + 30 : undefined,
      fileSize: languageStatus === 'complete' ? Math.floor(Math.random() * 5000000) + 1000000 : undefined,
      downloadUrl: languageStatus === 'complete' ? `#download-${lang.code}` : undefined
    };
  }).filter(Boolean) as LanguageProgress[];

  const completedLanguages = languages.filter(l => l.status === 'complete').length;
  
  return {
    id: jobId,
    status: randomStatus,
    progress,
    message,
    languages,
    totalLanguages: targetLanguages.length,
    completedLanguages,
    startedAt: new Date(Date.now() - Math.random() * 300000).toISOString(),
    estimatedCompletion: progress < 100 ? new Date(Date.now() + Math.random() * 300000).toISOString() : undefined
  };
};

// Simulate job progress over time
export const simulateJobProgress = (
  jobId: string,
  targetLanguages: string[],
  onProgress: (status: GetJobStatusResponse) => void,
  onComplete: () => void
) => {
  let progress = 0;
  const statuses: JobStatus['status'][] = ['uploading', 'processing', 'generating', 'finalizing', 'complete'];
  let currentStatusIndex = 0;
  
  const interval = setInterval(async () => {
    const currentStatus = statuses[currentStatusIndex];
    
    switch (currentStatus) {
      case 'uploading':
        progress = Math.min(30, progress + Math.random() * 5);
        if (progress >= 30) currentStatusIndex++;
        break;
      case 'processing':
        progress = Math.min(60, progress + Math.random() * 3);
        if (progress >= 60) currentStatusIndex++;
        break;
      case 'generating':
        progress = Math.min(85, progress + Math.random() * 2);
        if (progress >= 85) currentStatusIndex++;
        break;
      case 'finalizing':
        progress = Math.min(100, progress + Math.random() * 1);
        if (progress >= 100) currentStatusIndex++;
        break;
      case 'complete':
        clearInterval(interval);
        onComplete();
        break;
    }
    
    const messages = {
      uploading: 'Uploading files...',
      processing: 'Processing audio...',
      generating: 'Generating dubs...',
      finalizing: 'Finalizing...',
      complete: 'Complete!',
    };
    
    // Get detailed status with individual language progress
    const detailedStatus = await getJobStatus(jobId, targetLanguages);
    detailedStatus.status = currentStatus;
    detailedStatus.progress = Math.floor(progress);
    detailedStatus.message = messages[currentStatus];
    
    onProgress(detailedStatus);
  }, 200);
  
  return () => clearInterval(interval);
};
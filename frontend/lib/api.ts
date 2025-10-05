import { DubbingJobData, JobStatus, SubmitJobResponse, GetJobStatusResponse } from '@/types';

// Mock API functions for the YouTube Multilingual Dubber app

export const submitDubbingJob = async (data: DubbingJobData): Promise<SubmitJobResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate random job ID
  const jobId = Math.random().toString(36).substr(2, 9);
  
  return { jobId };
};

export const getJobStatus = async (jobId: string): Promise<GetJobStatusResponse> => {
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
  
  return {
    id: jobId,
    status: randomStatus,
    progress,
    message,
  };
};

// Simulate job progress over time
export const simulateJobProgress = (
  jobId: string,
  onProgress: (status: GetJobStatusResponse) => void,
  onComplete: () => void
) => {
  let progress = 0;
  const statuses: JobStatus['status'][] = ['uploading', 'processing', 'generating', 'finalizing', 'complete'];
  let currentStatusIndex = 0;
  
  const interval = setInterval(() => {
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
    
    onProgress({
      id: jobId,
      status: currentStatus,
      progress: Math.floor(progress),
      message: messages[currentStatus],
    });
  }, 200);
  
  return () => clearInterval(interval);
};
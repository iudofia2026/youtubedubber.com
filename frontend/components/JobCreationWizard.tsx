'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import { LanguageChecklist } from './LanguageChecklist';
import { LANGUAGES, UploadProgress } from '@/types';
import { useToastHelpers, useApiErrorHandler } from '@/components/ToastNotifications';
import { LoadingButton } from '@/components/LoadingStates';
import { submitDubbingJob } from '@/lib/api';

interface JobCreationWizardProps {
  onSubmit: (data: { voiceTrack: File; backgroundTrack?: File; targetLanguages: string[] }) => void;
}

const steps = [
  { id: 1, title: 'Upload Voice Track', description: 'Upload your voice-only audio file' },
  { id: 2, title: 'Upload Background', description: 'Add background music or ambient audio (optional)' },
  { id: 3, title: 'Select Languages', description: 'Choose target languages for dubbing' },
  { id: 4, title: 'Review & Submit', description: 'Review your selections and submit' }
];

export default function JobCreationWizard({ onSubmit }: JobCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [formData, setFormData] = useState({
    voiceTrack: null as File | null,
    backgroundTrack: null as File | null,
    targetLanguages: [] as string[],
    voiceTrackDuration: null as number | null,
    backgroundTrackDuration: null as number | null,
  });
  const { success, error: showError } = useToastHelpers();
  const { handleApiError } = useApiErrorHandler();

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !formData.voiceTrack) {
      showError('Voice track required', 'Please upload a voice track before proceeding.');
      return;
    }
    
    if (currentStep === 3 && formData.targetLanguages.length === 0) {
      showError('Language selection required', 'Please select at least one target language before proceeding.');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.voiceTrack) {
      showError('Voice track required', 'Please upload a voice track to continue.');
      return;
    }

    if (formData.targetLanguages.length === 0) {
      showError('Language selection required', 'Please select at least one target language to continue.');
      return;
    }

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
      
      success('Job submitted successfully', 'Your dubbing job has been queued for processing.');
      
      // Call the parent onSubmit callback
      onSubmit({
        voiceTrack: formData.voiceTrack,
        backgroundTrack: formData.backgroundTrack || undefined,
        targetLanguages: formData.targetLanguages
      });
      
    } catch (error) {
      console.error('Failed to submit job:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error submitting your job. Please try again.';
      handleApiError(error, 'Job Submission');
      setUploadProgress({
        progress: 0,
        status: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.voiceTrack !== null;
      case 2:
        return true; // Background track is optional
      case 3:
        return formData.targetLanguages.length > 0;
      case 4:
        return formData.voiceTrack !== null && formData.targetLanguages.length > 0;
      default:
        return false;
    }
  };

  const stepVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.id
                    ? 'bg-[var(--youtube-red)] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={{
                  scale: currentStep === step.id ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {step.id}
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-[var(--youtube-red)]' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
          <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {currentStep === 1 && (
              <div className="space-y-6">
                <FileUpload
                  label="Voice Track"
                  required
                  accept="audio/*"
                  maxSize={100}
                  onFileSelect={(file) => setFormData(prev => ({ ...prev, voiceTrack: file }))}
                  value={formData.voiceTrack}
                />
                <div className="text-center text-sm text-muted-foreground">
                  <p>🎤 Upload your voice-only audio file</p>
                  <p>Supported formats: MP3, WAV, M4A</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <FileUpload
                  label="Background Track (Optional)"
                  required={false}
                  accept="audio/*"
                  maxSize={100}
                  onFileSelect={(file) => setFormData(prev => ({ ...prev, backgroundTrack: file }))}
                  value={formData.backgroundTrack}
                />
                <div className="text-center text-sm text-muted-foreground">
                  <p>🎵 Add background music or ambient audio</p>
                  <p>This step is optional - you can skip it</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <LanguageChecklist
                  value={formData.targetLanguages}
                  onChange={(languages) => setFormData(prev => ({ ...prev, targetLanguages: languages }))}
                  languages={LANGUAGES}
                />
                <div className="text-center text-sm text-muted-foreground">
                  <p>🌍 Choose the language for your dubbing</p>
                  <p>We&apos;ll generate natural-sounding speech in this language</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Submission</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Voice Track:</span>
                      <span className="font-medium">
                        {formData.voiceTrack?.name || 'Not selected'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Background Track:</span>
                      <span className="font-medium">
                        {formData.backgroundTrack?.name || 'Not selected'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Target Language:</span>
                      <span className="font-medium">
                        {formData.targetLanguages.length > 0 ? formData.targetLanguages.join(', ') : 'Not selected'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>✅ Ready to start dubbing!</p>
                  <p>Click submit to begin processing your audio</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6"
        >
          Previous
        </Button>
        
        {currentStep < steps.length ? (
          <Button
            onClick={nextStep}
            disabled={!isStepValid(currentStep)}
            className="px-6 bg-[var(--youtube-red)] hover:bg-[var(--youtube-red-dark)]"
          >
            Next
          </Button>
        ) : (
          <LoadingButton
            loading={isSubmitting}
            onClick={handleSubmit}
            disabled={!isStepValid(4)}
            className="px-6 bg-[var(--youtube-red)] hover:bg-[var(--youtube-red-dark)]"
          >
            Submit Job
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
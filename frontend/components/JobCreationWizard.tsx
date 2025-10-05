'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import { LanguageSelect } from './LanguageSelect';
import { LANGUAGES } from '@/types';

interface JobCreationWizardProps {
  onSubmit: (data: { voiceTrack: File; backgroundTrack?: File; targetLanguage: string }) => void;
}

const steps = [
  { id: 1, title: 'Upload Voice Track', description: 'Upload your voice-only audio file' },
  { id: 2, title: 'Upload Background', description: 'Add background music or ambient audio (optional)' },
  { id: 3, title: 'Select Language', description: 'Choose target language for dubbing' },
  { id: 4, title: 'Review & Submit', description: 'Review your selections and submit' }
];

export default function JobCreationWizard({ onSubmit }: JobCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    voiceTrack: null as File | null,
    backgroundTrack: null as File | null,
    targetLanguage: '',
  });

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.voiceTrack !== null;
      case 2:
        return true; // Background track is optional
      case 3:
        return formData.targetLanguage !== '';
      case 4:
        return formData.voiceTrack !== null && formData.targetLanguage !== '';
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
                <LanguageSelect
                  value={formData.targetLanguage}
                  onChange={(language) => setFormData(prev => ({ ...prev, targetLanguage: language }))}
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
                        {formData.targetLanguage || 'Not selected'}
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
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid(4)}
            className="px-6 bg-[var(--youtube-red)] hover:bg-[var(--youtube-red-dark)]"
          >
            Submit Job
          </Button>
        )}
      </div>
    </div>
  );
}
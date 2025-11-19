'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Trash2,
  Shield,
  Database,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataSummary {
  jobs?: number;
  languageTasks?: number;
  artifacts?: number;
  creditTransactions?: number;
  userCredits?: number;
  storageFiles?: number;
  jobEvents?: number;
}

interface DeletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userEmail: string;
}

type DeletionStep = 'warning' | 'confirmation' | 'preview' | 'final' | 'processing' | 'complete';

export function AccountDeletionDialog({
  isOpen,
  onClose,
  onComplete,
  userEmail
}: DeletionDialogProps) {
  const [step, setStep] = useState<DeletionStep>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [deletionToken, setDeletionToken] = useState('');
  const [dataSummary, setDataSummary] = useState<DataSummary>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetDialog = () => {
    setStep('warning');
    setConfirmationText('');
    setReason('');
    setFeedback('');
    setDeletionToken('');
    setDataSummary({});
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    if (step !== 'processing') {
      resetDialog();
      onClose();
    }
  };

  const handleInitiateDeletion = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/account/delete/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          confirmationText,
          reason: reason || undefined,
          feedback: feedback || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initiate deletion');
      }

      const data = await response.json();
      setDeletionToken(data.deletionToken);
      setDataSummary(data.dataToBeDeleted || {});
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate account deletion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    setError('');
    setIsLoading(true);
    setStep('processing');

    try {
      const response = await fetch('/api/account/delete/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          deletionToken,
          finalConfirmation: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to complete deletion');
      }

      setStep('complete');

      // Sign out after a brief delay
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete account deletion');
      setStep('preview'); // Go back to preview on error
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmationValid = confirmationText === 'DELETE MY ACCOUNT';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 'warning' && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <DialogTitle className="text-2xl">Delete Account</DialogTitle>
                </div>
                <DialogDescription className="text-base space-y-4">
                  <p className="font-semibold text-foreground">
                    This action is permanent and cannot be undone.
                  </p>
                  <p>When you delete your account, the following will happen:</p>
                  <ul className="space-y-2 ml-6 list-disc">
                    <li>Your account and profile will be permanently deleted</li>
                    <li>All dubbing jobs and generated content will be deleted</li>
                    <li>All uploaded files will be removed from storage</li>
                    <li>Your credit balance and transaction history will be deleted</li>
                    <li>You will be immediately signed out</li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    A deletion audit log will be retained for compliance purposes (GDPR requirement).
                  </p>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStep('confirmation')}
                >
                  Continue with Deletion
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogDescription>
                  Please confirm that you want to delete your account for {userEmail}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-6">
                <div className="space-y-2">
                  <Label htmlFor="confirmationText">
                    Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm
                  </Label>
                  <Input
                    id="confirmationText"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className={`font-mono ${
                      confirmationText && !isConfirmationValid
                        ? 'border-destructive focus:border-destructive'
                        : ''
                    }`}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-sm text-destructive">
                      Text must match exactly: DELETE MY ACCOUNT
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for deletion (optional)</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., No longer need the service"
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback (optional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Help us improve by sharing your experience"
                    maxLength={1000}
                    rows={3}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('warning')}>
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleInitiateDeletion}
                  disabled={!isConfirmationValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Review Deletion'
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Review Data to be Deleted</DialogTitle>
                <DialogDescription>
                  The following data will be permanently deleted. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="my-6 space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <DataItem
                    icon={Database}
                    label="Dubbing Jobs"
                    count={dataSummary.jobs || 0}
                  />
                  <DataItem
                    icon={FileText}
                    label="Language Tasks"
                    count={dataSummary.languageTasks || 0}
                  />
                  <DataItem
                    icon={FileText}
                    label="Generated Files"
                    count={dataSummary.storageFiles || 0}
                  />
                  <DataItem
                    icon={FileText}
                    label="Artifacts"
                    count={dataSummary.artifacts || 0}
                  />
                  <DataItem
                    icon={CreditCard}
                    label="Credit Transactions"
                    count={dataSummary.creditTransactions || 0}
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    You have 10 minutes to complete this deletion. After that, you'll need to start
                    over.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('confirmation')}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStep('final')}
                >
                  Continue to Final Confirmation
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl">Final Confirmation</DialogTitle>
                </div>
                <DialogDescription className="text-base space-y-4">
                  <p className="font-semibold text-foreground">
                    This is your last chance to cancel.
                  </p>
                  <p>
                    Once you click "Delete My Account Forever", all your data will be permanently
                    deleted and cannot be recovered.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account: <span className="font-semibold">{userEmail}</span>
                  </p>
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive" className="my-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setStep('preview')}>
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDeletion}
                  disabled={isLoading}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account Forever
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">Deleting Your Account</h3>
                <p className="text-muted-foreground text-center">
                  Please wait while we permanently delete all your data...
                </p>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Account Deleted</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Your account and all associated data have been permanently deleted. You will be
                  signed out shortly.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

interface DataItemProps {
  icon: React.ElementType;
  label: string;
  count: number;
}

function DataItem({ icon: Icon, label, count }: DataItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-bold">{count.toLocaleString()}</span>
    </div>
  );
}

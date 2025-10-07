'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, Settings, LogOut, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/auth-schemas';
import { useAuth } from '@/lib/auth-context';

interface UserProfileProps {
  onClose?: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateProfile, signOut } = useAuth();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      avatarUrl: user?.user_metadata?.avatar_url || '',
    },
  });

  const handleSave = async (data: UpdateProfileFormData) => {
    setIsLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: data.fullName,
        avatar_url: data.avatarUrl || undefined,
      });
      
      if (!error) {
        setIsEditing(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  if (!user) return null;

  return (
    <motion.div
      className="bg-card border border-border rounded-lg p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(handleSave)}
                disabled={isLoading}
                className="bg-[#ff0000] hover:bg-[#cc0000]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {user.user_metadata?.full_name || 'No name set'}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Enter your full name"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                <Input
                  id="avatarUrl"
                  {...form.register('avatarUrl')}
                  placeholder="https://example.com/avatar.jpg"
                />
                {form.formState.errors.avatarUrl && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.avatarUrl.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Info */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
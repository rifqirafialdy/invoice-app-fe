'use client';

import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../../lib/stores/authStore';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { User, Image as ImageIcon } from 'lucide-react';
import { userApi } from '../../../lib/api/userApi';
import Image from 'next/image';
import PasswordInput from '../../../components/ui/passwordInput';
import { 
  logoSchema, 
  profileSchema, 
  changePasswordSchema,
  emailChangeSchema,
  type LogoFormData, 
  type ProfileFormData, 
  type ChangePasswordFormData,
  type EmailChangeFormData
} from '../../../lib/validations/user';

export default function SettingsPage() {
  const { user, updateProfile, uploadLogo } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', companyName: user?.companyName || '' },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const logoForm = useForm<LogoFormData>({
    resolver: zodResolver(logoSchema),
  });

  const emailForm = useForm<EmailChangeFormData>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: { newEmail: '', currentPassword: '' }
  });
  
  const selectedFile = logoForm.watch('file')?.[0];

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSuccessMessage(''); setErrorMessage('');
    try {
      await updateProfile(data);
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update profile.');
    }
  };
  
  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setSuccessMessage(''); setErrorMessage('');
    try {
      await userApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      passwordForm.reset();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to change password.');
    }
  };

  const onLogoSubmit = async (data: LogoFormData) => {
    setSuccessMessage(''); setErrorMessage('');
    try {
      await uploadLogo(data.file[0]);
      setSuccessMessage('Logo uploaded successfully!');
      logoForm.reset();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to upload logo.');
    }
  };

  const onEmailChangeSubmit = async (data: EmailChangeFormData) => {
    setSuccessMessage(''); setErrorMessage('');
    try {
      await userApi.requestEmailChange(data);
      setSuccessMessage('A verification link has been sent to your current email address. Please check your inbox.');
      emailForm.reset();
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to request email change.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account and company details</p>
      </div>

      {successMessage && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">{successMessage}</div>}
      {errorMessage && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{errorMessage}</div>}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Information</CardTitle>
              <CardDescription>Update your personal and company details.</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <FormField control={profileForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Email</CardTitle>
              <CardDescription>Your current email is <strong>{user?.email}</strong></CardDescription>
            </CardHeader>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailChangeSubmit)}>
                <CardContent className="space-y-4">
                  <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="Enter new email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={emailForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl><PasswordInput placeholder="Enter current password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                      {emailForm.formState.isSubmitting ? 'Sending...' : 'Request Email Change'}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Form>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Upload or update your company logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...logoForm}>
                <form onSubmit={logoForm.handleSubmit(onLogoSubmit)} className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="size-24 border rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                      {user?.logoUrl ? (
                        <Image src={user.logoUrl} alt="Company Logo" width={96} height={96} className="object-contain" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <FormField control={logoForm.control} name="file" render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Choose Image</FormLabel>
                        <FormControl>
                          <Input 
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) => onChange(e.target.files)}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end pt-2">
                    {selectedFile && (
                      <Button type="submit" disabled={logoForm.formState.isSubmitting}>
                        {logoForm.formState.isSubmitting ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl><PasswordInput {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl><PasswordInput {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl><PasswordInput {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
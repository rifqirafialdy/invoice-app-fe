'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/userApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailChangePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await userApi.verifyEmailChange(token);
        setStatus('success');
        setMessage(response.data.message || 'Email changed successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Failed to verify email change. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
            {status === 'error' && <XCircle className="w-16 h-16 text-red-500" />}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verifying Email Change...'}
            {status === 'success' && 'Email Changed Successfully'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Your email address has been updated. Please log in again with your new email.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                You can request a new email change from your settings page.
              </p>
              <Button onClick={() => router.push('/settings')} className="w-full">
                Go to Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
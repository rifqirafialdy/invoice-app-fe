'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authApi.verifyEmail(token);
      
      setStatus('success');
      setMessage(response.data.message || 'Your email has been verified successfully!');
      
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {status === 'success' ? 'Email Verified' : status === 'verifying' ? 'Verifying...' : 'Verification Failed'}
        </CardTitle>
        <CardDescription>
          {status === 'verifying' && 'Please wait while we verify your email...'}
          {status === 'success' && 'You can now login to your account'}
          {status === 'error' && 'There was a problem verifying your email'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status === 'verifying' && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600">{message}</p>
            <p className="text-sm text-slate-500 mt-2">Redirecting to login...</p>
          </div>
        )}
        
       {status === 'error' && (
  <div className="space-y-4">
    <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
      {message}
    </div>
    
    <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
      <p className="font-medium mb-2">Verification link expired?</p>
      <p>Please login with your credentials to request a new verification link.</p>
    </div>

    
  </div>
)}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
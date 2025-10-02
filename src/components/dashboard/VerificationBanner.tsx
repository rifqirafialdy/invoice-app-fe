'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/authApi';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function VerificationBanner() {
  const { user } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  if (user?.isVerified) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsSending(true);
    setMessage('');
    setMessageType(null);

    try {
      await authApi.sendVerification();
      setMessage('Verification email sent! Please check your inbox.');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to send verification email');
      setMessageType('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="ml-2 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Please verify your email address
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            We've sent a verification link to <strong>{user?.email}</strong>
          </p>
          {message && (
            <p className={`text-xs mt-2 ${
              messageType === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {messageType === 'success' && <CheckCircle className="inline w-3 h-3 mr-1" />}
              {message}
            </p>
          )}
        </div>
        <Button
          onClick={handleSendVerification}
          disabled={isSending}
          size="sm"
          variant="outline"
          className="ml-4"
        >
          <Mail className="w-4 h-4 mr-2" />
          {isSending ? 'Sending...' : 'Send Verification Email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
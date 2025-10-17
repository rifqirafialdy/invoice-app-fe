
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api/authApi';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface UnverifiedUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnverifiedUserDialog({ isOpen, onClose }: UnverifiedUserDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleSendVerification = async () => {
    setIsSending(true);
    setMessage('');
    setMessageType(null);

    try {
      await authApi.sendVerification();
      setMessage('A new verification email has been sent to your inbox!');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to send verification email. Please try again.');
      setMessageType('error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
            Verification Required
          </DialogTitle>
          <DialogDescription className="pt-2">
            Please verify your email address to access this feature. Check your inbox for the verification link.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Button
            onClick={handleSendVerification}
            disabled={isSending}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
          {message && (
            <p className={`text-xs mt-3 text-center ${
              messageType === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {messageType === 'success' && <CheckCircle className="inline w-3 h-3 mr-1" />}
              {message}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
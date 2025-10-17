'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api/publicApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, XCircle, CheckCircle } from 'lucide-react';

export default function CancelRequestPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking link validity...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      setStatus('confirm');
      setMessage('Do you want to submit a request to cancel this invoice? The owner will be notified for approval.');
    } else {
      setStatus('error');
      setMessage('Invalid cancellation link. Token is missing.');
    }
  }, [token]);

  const handleConfirmCancel = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await publicApi.requestCancellation(token);
      
      setStatus('success');
      setMessage(response.data.message || 'Cancellation request successfully submitted. The owner will review and confirm the cancellation.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to submit cancellation request. The link may have expired or been used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContent = {
    loading: { Icon: Loader2, title: 'Processing Request', color: 'text-blue-600', button: 'Verifying...' },
    confirm: { Icon: AlertTriangle, title: 'Confirmation Required', color: 'text-yellow-600', button: 'Yes, Request Cancellation' },
    success: { Icon: CheckCircle, title: 'Request Sent', color: 'text-green-600', button: 'Done' },
    error: { Icon: XCircle, title: 'Request Failed', color: 'text-red-600', button: 'Close' },
  }[status] || { Icon: Loader2, title: 'Processing Request', color: 'text-blue-600', button: 'Verifying...' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-slate-100">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <cardContent.Icon className={`w-12 h-12 ${cardContent.color} ${status === 'loading' ? 'animate-spin' : ''}`} />
          </div>
          <CardTitle className="text-2xl font-bold">{cardContent.title}</CardTitle>
          <CardDescription className="text-slate-600">
            {message}
          </CardDescription>
        </CardHeader>
        
        {status === 'confirm' && (
          <CardContent>
            <Button 
              onClick={handleConfirmCancel} 
              disabled={isSubmitting} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : cardContent.button}
            </Button>
          </CardContent>
        )}
        
        {(status === 'success' || status === 'error') && (
          <CardFooter className="justify-center">
             <Button onClick={() => window.close()} variant="outline">
                {cardContent.button}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
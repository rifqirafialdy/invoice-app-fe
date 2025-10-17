'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { publicApi } from '@/lib/api/publicApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Banknote, XCircle } from 'lucide-react';

export default function PayInvoicePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking link validity...');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      setStatus('confirm');
      setMessage('You are confirming that you have made the payment for this invoice. Click the button below to notify the owner.');
    } else {
      setStatus('error');
      setMessage('Invalid payment link. Token is missing.');
    }
  }, [token]);

  const handleConfirmPayment = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await publicApi.confirmPayment(token);
      
      setStatus('success');
      setMessage(response.data.message || 'Payment confirmation received. The payment is pending manual verification.'); 
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Failed to submit payment confirmation. The link may have expired or been used.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardContent = {
    loading: { Icon: Loader2, title: 'Processing Request', color: 'text-blue-600', button: 'Verifying...' },
    confirm: { Icon: Banknote, title: 'Confirm Payment', color: 'text-blue-600', button: 'I Have Paid' },
    success: { Icon: CheckCircle, title: 'Confirmation Sent', color: 'text-green-600', button: 'Done' },
    error: { Icon: XCircle, title: 'Request Failed', color: 'text-red-600', button: 'Close' },
  }[status];

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
        
        <CardContent>
          {status === 'confirm' && (
            <Button 
              onClick={handleConfirmPayment} 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : cardContent.button}
            </Button>
          )}
        </CardContent>

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
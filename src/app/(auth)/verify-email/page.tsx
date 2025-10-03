import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email address
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-600 mb-4">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
          <p className="font-medium mb-1">Didn't receive the email?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Check your spam folder</li>
            <li>Wait a few minutes for the email to arrive</li>
            <li>Make sure you entered the correct email</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          Back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
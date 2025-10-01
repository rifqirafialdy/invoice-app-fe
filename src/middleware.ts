import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/' || 
                       path === '/login' || 
                       path === '/register' || 
                       path.startsWith('/verify-email') ||
                       path === '/verify-required' ||
                       path === '/forgot-password';
  
  // Protected paths
  const isProtectedPath = path.startsWith('/dashboard');
  
  // For now, we can't check localStorage in middleware (it's server-side)
  // So we'll handle redirects client-side in the components
  // Just protect the dashboard routes
  
  if (isProtectedPath) {
    // Let the dashboard layout handle auth check client-side
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
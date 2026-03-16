import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/';
  
  const isStaticFile = pathname.startsWith('/_next') || 
                       pathname.startsWith('/api') ||
                       pathname === '/favicon.ico' ||
                       pathname === '/manifest.json' ||
                       pathname.includes('.'); 

  if (isStaticFile) {
    return NextResponse.next();
  }

  
  if (!token) {
 
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

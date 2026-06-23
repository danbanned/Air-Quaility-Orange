import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth(function proxy(request) {
  const session = request.auth;
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    if (session?.user?.canAccessAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!session?.user?.canAccessAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};

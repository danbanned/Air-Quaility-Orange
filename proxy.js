import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function proxy(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    if (pathname.startsWith('/login') || pathname.startsWith('/admin/login')) {
      if (token?.canAccessAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      return NextResponse.next();
    }

    if (pathname.startsWith('/admin') && !token?.canAccessAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/admin/login')) {
          return true;
        }

        if (req.nextUrl.pathname.startsWith('/login')) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};

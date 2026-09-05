import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ktp_cad_library_jwt_secret_key_2026_super_secure'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('ktp_token')?.value;

  // Protect /account routes
  if (pathname.startsWith('/account')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = (payload.role as string) || '';

      // Check if user is staff (ADMIN, TECHNICAL, SALES)
      if (!['ADMIN', 'TECHNICAL', 'SALES'].includes(userRole)) {
        const homeUrl = new URL('/account', req.url);
        homeUrl.searchParams.set('forbidden', '1');
        return NextResponse.redirect(homeUrl);
      }

      // Special RBAC rule: TECHNICAL role cannot access /admin/payments or /admin/reports
      if (userRole === 'TECHNICAL') {
        if (pathname.startsWith('/admin/payments') || pathname.startsWith('/admin/reports')) {
          const adminDashboardUrl = new URL('/admin', req.url);
          adminDashboardUrl.searchParams.set('denied', 'technical_payment_restriction');
          return NextResponse.redirect(adminDashboardUrl);
        }
      }

      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};

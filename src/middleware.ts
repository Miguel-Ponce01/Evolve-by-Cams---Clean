import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
  const BYPASS_KEY = process.env.MAINTENANCE_BYPASS_KEY || 'dev-secret-key';
  const ALLOWED_IPS = ['127.0.0.1', '::1', '192.168.1.100']; // Dev IP Whitelist
  
  const path = request.nextUrl.pathname;
  const clientIp = request.ip || request.headers.get('x-forwarded-for') || '';
  const bypassHeader = request.headers.get('x-dev-bypass');

  // Trigger Maintenance Mode Lockout if flag is active and bypass rules do not match
  if (MAINTENANCE_MODE) {
    const isWhitelisted = ALLOWED_IPS.includes(clientIp) || bypassHeader === BYPASS_KEY;
    
    // Ignore next.js assets and requests with file extensions
    if (!isWhitelisted && !path.startsWith('/_next') && !path.includes('.')) {
      return new NextResponse(
        `<html>
          <head>
            <title>System Maintenance | Evolve Studio</title>
            <style>
              body { background-color: #0A0A0A; color: #F5F5F3; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .card { border: 1px solid #232323; background: #141414; padding: 40px; border-radius: 16px; max-width: 480px; }
              h1 { color: #C9A961; margin-bottom: 10px; }
              p { color: #A0A0A0; font-size: 14px; line-height: 1.5; }
              span { color: #5A5A5A; font-size: 10px; font-family: monospace; display: block; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Under Maintenance</h1>
              <p>We are currently upgrading our systems. Please check back in a few minutes.</p>
              <span>HTTP 503 SERVICE TEMPORARILY UNAVAILABLE</span>
            </div>
          </body>
        </html>`,
        {
          status: 503,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAdminSession = request.cookies.get('evolve-admin-session')?.value === 'true'

  // Protect admin, portal, roster, schedule, analytics, wallet, and profile routes from unauthenticated users
  const isProtectedRoute = path.startsWith('/portal') ||
                           path.startsWith('/roster') ||
                           path.startsWith('/schedule') ||
                           path.startsWith('/analytics') ||
                           path.startsWith('/wallet') ||
                           path.startsWith('/profile') ||
                           (path.startsWith('/admin') && path !== '/admin')

  if (isProtectedRoute && !user && !isAdminSession) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/admin/:path*',
    '/roster/:path*',
    '/schedule/:path*',
    '/analytics/:path*',
    '/wallet/:path*',
    '/profile/:path*',
  ],
}

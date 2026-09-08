import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Only run on routes that need session refresh — NOT on API routes,
  // public pages, or static assets (avoids 504 middleware timeout on Vercel).
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
  ],
}

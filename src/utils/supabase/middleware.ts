import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('auth timeout')), 1200)
      ),
    ]) as Awaited<ReturnType<typeof supabase.auth.getUser>>;
    user = result.data.user;
  } catch {
    // If Supabase is slow or unreachable, let the request through —
    // individual pages handle their own auth checks.
    return supabaseResponse;
  }

  // if (
  //   !user &&
  //   request.nextUrl.pathname.startsWith('/dashboard')
  // ) {
  //   // no user, potentially respond by redirecting the user to the login page
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/'
  //   return NextResponse.redirect(url)
  // }

  // OPTIONAL: Redirect authenticated users away from auth pages
  if (
     // Example: if they hit /auth and are logged in, send to dashboard
     user && 
     (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')
  ) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  return supabaseResponse
}

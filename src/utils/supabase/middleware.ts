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

  // Race the auth call against a 1.2s timeout — if Supabase is slow,
  // fall through and let individual pages handle their own auth checks.
  const fallback = new Promise<{ data: { user: null } }>(resolve =>
    setTimeout(() => resolve({ data: { user: null } }), 1200)
  );
  const { data: { user } } = await Promise.race([
    supabase.auth.getUser(),
    fallback,
  ]);

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

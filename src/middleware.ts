import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  // Refresh the user's session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If auth code is in the URL (from OAuth), redirect to clean URL
  const code = request.nextUrl.searchParams.get('code')
  if (code) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('code')
    url.searchParams.delete('state')
    url.searchParams.delete('error')
    url.searchParams.delete('error_description')
    return NextResponse.redirect(url)
  }

  // If user is logged in and on /auth, redirect to home
  if (user && request.nextUrl.pathname === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/api/:path*',
  ],
}

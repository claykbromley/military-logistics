import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Supabase Auth Middleware
 *
 * This runs on every request and refreshes the auth session if needed.
 * Without this, the Supabase access token expires after ~1 hour (or
 * sooner depending on settings), and all server-side API routes that
 * call `supabase.auth.getUser()` will fail — causing the "logged out"
 * appearance where data disappears.
 *
 * Place this file at the ROOT of your project as `middleware.ts`.
 */

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Set cookies on the response (for the browser)
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (request.nextUrl.pathname === "/api/send-notification-email") {
    return NextResponse.next()
  }

  // IMPORTANT: Do NOT use `getSession()` here — it reads from storage
  // without validating. `getUser()` actually calls Supabase auth and
  // triggers a token refresh if the access token has expired.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
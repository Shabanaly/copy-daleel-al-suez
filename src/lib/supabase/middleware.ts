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
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // --- Security Logic ---
    const path = request.nextUrl.pathname

    // 1. If trying to access /admin*, must be logged in
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Note: We technically "could" check the role here by querying DB,
        // but creating a Supabase client inside middleware to query DB is blocked by Edge limitations sometimes
        // or just slower. 
        // It's often better to let the Layout (Server Component) handle the specific Role check (which we did).
        // BUT, for extra security, if we have role in metadata, we can check it.
        // For now, Layout check is sufficient for MVP Security.
    }

    // 2. If logged in and trying to access /login, redirect to /
    if (path.startsWith('/login') && user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return supabaseResponse
}

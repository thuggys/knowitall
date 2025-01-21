import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AuthError } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}/error?error=No authorization code provided`)
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Session exchange error:', error.message)
        return NextResponse.redirect(
          `${requestUrl.origin}/error?error=${encodeURIComponent(error.message)}`
        )
      }
      throw error
    }

    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      `${new URL(request.url).origin}/error?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
} 
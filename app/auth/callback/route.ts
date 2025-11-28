import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        console.log("Auth callback successful for user:", data.user.id)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${origin}/auth/login?error=session_error`)
      }
    } catch (err) {
      console.error("Auth callback exception:", err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_exception`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
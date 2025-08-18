import { cookies } from "next/headers"
import { createServerClient as createSupabaseClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://demo-project.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "demo-anon-public-key"

console.log("[v0] Server Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING")
console.log("[v0] Server Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING")
console.log("[v0] Server Using URL:", SUPABASE_URL)
console.log("[v0] Server Using Key:", SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + "..." : "MISSING")

if (
  process.env.NODE_ENV === "development" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
) {
  console.warn(
    "[Supabase] Using demo credentials. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
      "to connect to your own project.",
  )
}

/**
 * Returns a typed Supabase client that shares cookies with the current request.
 * Call this from Server Components, Route Handlers, or Server Actions.
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  console.log("[v0] Creating server Supabase client with URL:", SUPABASE_URL)

  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

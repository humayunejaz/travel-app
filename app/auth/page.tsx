import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import AuthForm from "@/components/auth/auth-form"

interface AuthPageProps {
  searchParams: {
    invitation?: string
  }
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && !searchParams.invitation) {
      redirect("/dashboard")
    }
  } catch (error) {
    console.log("[v0] Auth page error:", error)
  }

  return <AuthForm invitationId={searchParams.invitation} />
}

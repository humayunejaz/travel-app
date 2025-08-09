import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import AuthForm from "@/components/auth/auth-form"

interface AuthPageProps {
  searchParams: {
    invitation?: string
  }
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // If user is logged in and has invitation, redirect to invitation page
    if (searchParams.invitation) {
      redirect(`/invitations/${searchParams.invitation}`)
    }
    redirect("/dashboard")
  }

  return <AuthForm invitationId={searchParams.invitation} />
}

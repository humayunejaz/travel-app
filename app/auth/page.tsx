import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import AuthForm from "@/components/auth/auth-form"

export default async function AuthPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return <AuthForm />
}

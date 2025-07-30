import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Navbar from "@/components/layout/navbar"
import UserDashboard from "@/components/dashboard/user-dashboard"
import AgencyDashboard from "@/components/dashboard/agency-dashboard"

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth")
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {user.role === "agency" ? <AgencyDashboard user={user} /> : <UserDashboard user={user} />}
      </main>
    </div>
  )
}

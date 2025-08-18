import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Navbar from "@/components/layout/navbar"
import UserDashboard from "@/components/dashboard/user-dashboard"
import AgencyDashboard from "@/components/dashboard/agency-dashboard"

export default async function DashboardPage() {
  let supabase
  let authUser
  let user

  try {
    supabase = await createServerClient()
    const authResult = await supabase.auth.getUser()
    authUser = authResult.data.user

    if (!authUser) {
      redirect("/auth")
    }

    const userResult = await supabase.from("users").select("*").eq("id", authUser.id).single()
    user = userResult.data

    if (!user) {
      redirect("/auth")
    }
  } catch (error) {
    console.log("[v0] Dashboard error:", error)
    await new Promise((resolve) => setTimeout(resolve, 1000))
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

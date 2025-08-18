import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AgencyDashboard } from "@/components/dashboard/agency-dashboard"

export default async function AgencyDashboardPage() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/auth")
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, agency_name")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "agency") {
      redirect("/dashboard")
    }

    return <AgencyDashboard />
  } catch (error) {
    console.error("[v0] Agency dashboard error:", error)
    redirect("/auth")
  }
}

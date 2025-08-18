import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function Home() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      redirect("/dashboard")
    } else {
      redirect("/home")
    }
  } catch (error) {
    console.log("[v0] Home page error:", error)
    redirect("/home")
  }
}

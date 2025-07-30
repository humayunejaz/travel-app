import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import InvitationAcceptPage from "@/components/invitations/invitation-accept-page"

interface InvitationPageProps {
  params: {
    id: string
  }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const supabase = await createServerClient()

  // Get the invitation
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(`
      *,
      trip:trips(*),
      inviter:users!invitations_inviter_id_fkey(*)
    `)
    .eq("id", params.id)
    .single()

  if (error || !invitation) {
    redirect("/auth?error=invitation-not-found")
  }

  if (invitation.status !== "pending") {
    redirect("/dashboard?message=invitation-already-processed")
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to auth with invitation context
    redirect(`/auth?invitation=${params.id}`)
  }

  // Check if the user's email matches the invitation
  if (user.email !== invitation.invitee_email) {
    redirect("/auth?error=email-mismatch")
  }

  return <InvitationAcceptPage invitation={invitation} />
}

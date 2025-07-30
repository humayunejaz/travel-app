import emailjs from "@emailjs/browser"

export interface InvitationEmailData {
  to: string
  inviterName: string
  tripName: string
  invitationId: string
  message?: string
  role: string
}

export async function sendInvitationEmail(emailData: InvitationEmailData) {
  try {
    // Initialize EmailJS with your public key
    emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)

    const invitationLink = `${window.location.origin}/invitations/${emailData.invitationId}`

    // The exact data being sent to EmailJS
    const templateParams = {
      inviter_name: emailData.inviterName,
      trip_name: emailData.tripName,
      invitation_link: invitationLink,
      message: emailData.message || "No personal message",
      role: emailData.role,
    }

    console.log("EmailJS Template Params:", templateParams)
    console.log("Service ID:", process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID)
    console.log("Template ID:", process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID)

    // Send email using EmailJS
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      templateParams,
    )

    console.log("Email sent successfully:", response)

    return {
      success: true,
      data: response,
      message: "Invitation email sent successfully!",
    }
  } catch (error) {
    console.error("EmailJS error:", error)
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

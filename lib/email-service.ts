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
    // Check if all required environment variables are present
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      throw new Error("EmailJS configuration is incomplete")
    }

    // Initialize EmailJS
    emailjs.init(publicKey)

    const invitationLink = `${window.location.origin}/home?invitation=${emailData.invitationId}`

    // Create template params
    const templateParams = {
      user_name: emailData.inviterName,
      user_email: emailData.to,
      message: `You've been invited to collaborate on "${emailData.tripName}" as a ${emailData.role}. 

${emailData.message ? `Personal message: "${emailData.message}"` : ""}

Click the link below to get started:
${invitationLink}

If you don't have an account yet, you can sign up for free and then accept the invitation.`,
    }

    // Send email
    const response = await emailjs.send(serviceId, templateId, templateParams)

    return {
      success: true,
      data: response,
      message: "Email sent successfully!",
    }
  } catch (error) {
    console.error("EmailJS error:", error)
    throw new Error(`EmailJS failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

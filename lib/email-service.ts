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

    console.log("=== EmailJS Debug Info ===")
    console.log("Service ID:", serviceId)
    console.log("Template ID:", templateId)
    console.log("Public Key:", publicKey ? `${publicKey.substring(0, 10)}...` : "Missing")

    if (!serviceId || !templateId || !publicKey) {
      throw new Error("EmailJS configuration is incomplete")
    }

    // Initialize EmailJS
    emailjs.init(publicKey)

    // Create the simplest possible template params
    const templateParams = {
      user_name: emailData.inviterName,
      user_email: emailData.to,
      message: `You've been invited to join "${emailData.tripName}" as a ${emailData.role}. Link: ${window.location.origin}/invitations/${emailData.invitationId}`,
    }

    console.log("=== Sending Email ===")
    console.log("Template Params:", templateParams)

    // Send email
    const response = await emailjs.send(serviceId, templateId, templateParams)

    console.log("=== Email Success ===")
    console.log("Response:", response)

    return {
      success: true,
      data: response,
      message: "Email sent successfully!",
    }
  } catch (error) {
    console.error("=== EmailJS Error ===")
    console.error("Full error object:", error)
    console.error("Error type:", typeof error)
    console.error("Error constructor:", error?.constructor?.name)

    if (error && typeof error === "object" && "text" in error) {
      console.error("Error text:", error.text)
    }
    if (error && typeof error === "object" && "status" in error) {
      console.error("Error status:", error.status)
    }

    throw new Error(`EmailJS failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

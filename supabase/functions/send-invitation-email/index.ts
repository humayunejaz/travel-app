import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to, inviterName, tripName, invitationLink, message } = await req.json()

    console.log("Sending invitation email to:", to)

    // For now, we'll just log the email details and return success
    // This allows us to test the system without actual email sending
    const emailData = {
      to,
      inviterName,
      tripName,
      invitationLink,
      message,
      timestamp: new Date().toISOString(),
    }

    console.log("Email data:", emailData)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Invitation email logged successfully (test mode)",
        data: emailData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

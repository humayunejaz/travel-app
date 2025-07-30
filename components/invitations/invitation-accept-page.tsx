"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin, Calendar, User } from "lucide-react"
import type { Invitation } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface InvitationAcceptPageProps {
  invitation: Invitation
}

export default function InvitationAcceptPage({ invitation }: InvitationAcceptPageProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleResponse = async (status: "accepted" | "declined") => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("invitations")
        .update({
          status,
          invitee_id: user.id,
        })
        .eq("id", invitation.id)

      if (invitationError) throw invitationError

      // If accepted, add as collaborator
      if (status === "accepted") {
        const { error: collaboratorError } = await supabase.from("trip_collaborators").insert({
          trip_id: invitation.trip_id,
          user_id: user.id,
          role: invitation.role,
          added_by: invitation.inviter_id,
        })

        if (collaboratorError) throw collaboratorError
      }

      toast({
        title: status === "accepted" ? "Invitation accepted!" : "Invitation declined",
        description:
          status === "accepted"
            ? "You can now collaborate on this trip. Redirecting to dashboard..."
            : "The invitation has been declined.",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Trip Invitation</CardTitle>
          <CardDescription>You've been invited to collaborate on a trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{invitation.trip?.name}</h3>
              {invitation.trip?.description && (
                <p className="text-gray-600 text-sm mt-1">{invitation.trip.description}</p>
              )}
            </div>

            {invitation.trip?.destinations && invitation.trip.destinations.length > 0 && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {invitation.trip.destinations.slice(0, 3).map((destination) => (
                    <Badge key={destination} variant="outline" className="text-xs">
                      {destination}
                    </Badge>
                  ))}
                  {invitation.trip.destinations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{invitation.trip.destinations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {(invitation.trip?.start_date || invitation.trip?.end_date) && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {invitation.trip.start_date && formatDate(invitation.trip.start_date)}
                  {invitation.trip.start_date && invitation.trip.end_date && " - "}
                  {invitation.trip.end_date && formatDate(invitation.trip.end_date)}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Invited by {invitation.inviter?.full_name || invitation.inviter?.email}
              </span>
              <Badge variant="outline">{invitation.role}</Badge>
            </div>
          </div>

          {/* Personal Message */}
          {invitation.message && (
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
              <p className="text-sm text-blue-800">{invitation.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={() => handleResponse("accepted")} disabled={loading} className="flex-1">
              <Check className="mr-2 h-4 w-4" />
              Accept Invitation
            </Button>
            <Button variant="outline" onClick={() => handleResponse("declined")} disabled={loading} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

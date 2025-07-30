"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin } from "lucide-react"
import type { Invitation } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface InvitationCardProps {
  invitation: Invitation
  onResponse: () => void
}

export default function InvitationCard({ invitation, onResponse }: InvitationCardProps) {
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleResponse = async (status: "accepted" | "declined") => {
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      console.log("Responding to invitation:", {
        invitationId: invitation.id,
        status,
        userId: user.id,
        tripId: invitation.trip_id,
        role: invitation.role,
      })

      // Update invitation status
      const { error: invitationError } = await supabase
        .from("invitations")
        .update({
          status,
          invitee_id: user.id,
        })
        .eq("id", invitation.id)

      if (invitationError) {
        console.error("Error updating invitation:", invitationError)
        throw invitationError
      }

      console.log("Invitation updated successfully")

      // If accepted, add as collaborator
      if (status === "accepted") {
        console.log("Adding collaborator...")

        // Check if collaborator already exists
        const { data: existingCollaborator } = await supabase
          .from("trip_collaborators")
          .select("id")
          .eq("trip_id", invitation.trip_id)
          .eq("user_id", user.id)
          .single()

        if (existingCollaborator) {
          console.log("Collaborator already exists")
        } else {
          const { data: collaboratorData, error: collaboratorError } = await supabase
            .from("trip_collaborators")
            .insert({
              trip_id: invitation.trip_id,
              user_id: user.id,
              role: invitation.role,
              added_by: invitation.inviter_id,
            })
            .select()

          if (collaboratorError) {
            console.error("Error adding collaborator:", collaboratorError)
            throw collaboratorError
          }

          console.log("Collaborator added successfully:", collaboratorData)
        }
      }

      toast({
        title: status === "accepted" ? "Invitation accepted" : "Invitation declined",
        description:
          status === "accepted" ? "You can now collaborate on this trip." : "The invitation has been declined.",
      })

      onResponse()
    } catch (error: any) {
      console.error("Error responding to invitation:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{invitation.trip?.name || "Trip Invitation"}</CardTitle>
            <CardDescription>Invited by {invitation.inviter?.full_name || invitation.inviter?.email}</CardDescription>
          </div>
          <Badge variant="outline">{invitation.role}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitation.trip?.destinations && invitation.trip.destinations.length > 0 && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {invitation.trip.destinations.slice(0, 2).map((destination) => (
                <Badge key={destination} variant="outline" className="text-xs">
                  {destination}
                </Badge>
              ))}
              {invitation.trip.destinations.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{invitation.trip.destinations.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {invitation.message && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{invitation.message}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={() => handleResponse("accepted")} disabled={loading} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button variant="outline" onClick={() => handleResponse("declined")} disabled={loading} className="flex-1">
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

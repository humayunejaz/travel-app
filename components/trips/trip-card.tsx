"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, Calendar, Users, MoreHorizontal, Edit, Trash2, UserPlus, Eye } from "lucide-react"
import type { Trip } from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import InviteCollaboratorDialog from "@/components/invitations/invite-collaborator-dialog"
import EditTripDialog from "@/components/trips/edit-trip-dialog"

interface TripCardProps {
  trip: Trip
  onUpdate: () => void
  isAgencyView?: boolean
}

export default function TripCard({ trip, onUpdate, isAgencyView = false }: TripCardProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return

    setLoading(true)
    try {
      const { error } = await supabase.from("trips").delete().eq("id", trip.id)

      if (error) throw error

      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted successfully.",
      })

      onUpdate()
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
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{trip.name}</CardTitle>
              {trip.description && <CardDescription className="line-clamp-2">{trip.description}</CardDescription>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isAgencyView && (
                  <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Collaborator
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isAgencyView ? "Edit Trip (Agency)" : "Edit Trip"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={loading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isAgencyView ? "Delete Trip (Agency)" : "Delete Trip"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {trip.destinations.length > 0 && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-1">
                {trip.destinations.slice(0, 3).map((destination) => (
                  <Badge key={destination} variant="outline" className="text-xs">
                    {destination}
                  </Badge>
                ))}
                {trip.destinations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{trip.destinations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {(trip.start_date || trip.end_date) && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {trip.start_date && formatDate(trip.start_date)}
                {trip.start_date && trip.end_date && " - "}
                {trip.end_date && formatDate(trip.end_date)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {(() => {
                  const collaboratorCount = trip.collaborators?.length || 0
                  // Owner is always counted as 1, plus collaborators
                  const totalMembers = collaboratorCount + 1
                  return `${totalMembers} member${totalMembers !== 1 ? "s" : ""}`
                })()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={trip.privacy === "public" ? "default" : "secondary"}>
                {trip.privacy === "public" ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Public
                  </>
                ) : (
                  "Private"
                )}
              </Badge>
            </div>
          </div>

          {isAgencyView && trip.owner && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">Created by {trip.owner.full_name || trip.owner.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isAgencyView && (
        <InviteCollaboratorDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          tripId={trip.id}
          tripName={trip.name}
          onInviteSent={() => {
            setShowInviteDialog(false)
            onUpdate()
          }}
        />
      )}

      <EditTripDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        trip={trip}
        onTripUpdated={() => {
          setShowEditDialog(false)
          onUpdate()
        }}
      />
    </>
  )
}

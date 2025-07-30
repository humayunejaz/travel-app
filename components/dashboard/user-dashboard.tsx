"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MapPin, Calendar, Mail } from "lucide-react"
import type { User, Trip, Invitation } from "@/lib/types"
import CreateTripDialog from "@/components/trips/create-trip-dialog"
import TripCard from "@/components/trips/trip-card"
import InvitationCard from "@/components/invitations/invitation-card"

interface UserDashboardProps {
  user: User
}

export default function UserDashboard({ user }: UserDashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTrip, setShowCreateTrip] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [user.id])

  const fetchData = async () => {
    setLoading(true)

    try {
      console.log("Fetching data for user:", user.id)

      // First, let's get trips the simple way and add collaborators separately
      const { data: ownedTrips, error: ownedError } = await supabase
        .from("trips")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

      console.log("Owned trips:", { data: ownedTrips, error: ownedError })

      // Get trips where user is a collaborator
      const { data: collaboratorData, error: collabError } = await supabase
        .from("trip_collaborators")
        .select(`
          trip:trips(*)
        `)
        .eq("user_id", user.id)

      console.log("Collaborator data:", { data: collaboratorData, error: collabError })

      // Combine trips
      const collaboratorTrips = collaboratorData?.map((item) => item.trip).filter(Boolean) || []
      const allTrips = [...(ownedTrips || []), ...collaboratorTrips]
      const uniqueTrips = allTrips.filter((trip, index, self) => index === self.findIndex((t) => t.id === trip.id))

      console.log("Combined trips:", {
        owned: ownedTrips?.length || 0,
        collaborator: collaboratorTrips.length,
        total: uniqueTrips.length,
        trips: uniqueTrips,
      })

      // Now get collaborators for each trip
      const tripsWithCollaborators = await Promise.all(
        uniqueTrips.map(async (trip) => {
          const { data: collaborators } = await supabase
            .from("trip_collaborators")
            .select(`
              *,
              user:users(*)
            `)
            .eq("trip_id", trip.id)

          return {
            ...trip,
            collaborators: collaborators || [],
          }
        }),
      )

      console.log("Trips with collaborators:", tripsWithCollaborators)

      // Debug collaborators data
      tripsWithCollaborators.forEach((trip, index) => {
        console.log(`Trip ${index + 1} (${trip.name}):`, {
          id: trip.id,
          collaborators: trip.collaborators,
          collaboratorCount: trip.collaborators?.length || 0,
        })
      })

      // Fetch pending invitations
      const { data: invitationsData, error: invError } = await supabase
        .from("invitations")
        .select(`
          *,
          trip:trips(*),
          inviter:users!invitations_inviter_id_fkey(*)
        `)
        .eq("status", "pending")
        .eq("invitee_email", user.email)

      console.log("Invitations:", { data: invitationsData, error: invError })

      setTrips(tripsWithCollaborators)
      setInvitations(invitationsData || [])
    } catch (error) {
      console.error("Error in fetchData:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTripCreated = () => {
    console.log("Trip created, refreshing data...")
    fetchData()
    setShowCreateTrip(false)
  }

  const handleInvitationResponse = () => {
    fetchData()
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  console.log("Rendering dashboard with trips:", trips.length)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.full_name}!</h1>
          <p className="text-gray-600">Plan your next adventure</p>
        </div>
        <Button onClick={() => setShowCreateTrip(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Trip
        </Button>
      </div>

      {/* Debug info - remove this later */}
      <div className="bg-gray-100 p-4 rounded text-sm">
        <p>
          <strong>Debug:</strong> User ID: {user.id}
        </p>
        <p>
          <strong>Trips found:</strong> {trips.length}
        </p>
        <p>
          <strong>Invitations:</strong> {invitations.length}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trips.filter((trip) => trip.start_date && new Date(trip.start_date) > new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Invitations</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} onResponse={handleInvitationResponse} />
            ))}
          </div>
        </div>
      )}

      {/* Trips */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Trips</h2>
        {trips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start planning your first adventure by creating a new trip.
              </p>
              <Button onClick={() => setShowCreateTrip(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onUpdate={fetchData} />
            ))}
          </div>
        )}
      </div>

      <CreateTripDialog open={showCreateTrip} onOpenChange={setShowCreateTrip} onTripCreated={handleTripCreated} />
    </div>
  )
}

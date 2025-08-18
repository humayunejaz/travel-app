"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Eye } from "lucide-react"
import type { User, Trip } from "@/lib/types"
import TripCard from "@/components/trips/trip-card"

interface AgencyDashboardProps {
  user?: User
}

export function AgencyDashboard({ user }: AgencyDashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(user || null)

  const supabase = createClient()

  const fetchUser = async () => {
    if (!user) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

        if (profile) {
          setCurrentUser({
            id: authUser.id,
            email: authUser.email || "",
            full_name: profile.full_name,
            role: profile.role,
            agency_name: profile.agency_name,
            created_at: profile.created_at,
          })
        }
      }
    }
  }

  const fetchTrips = async () => {
    setLoading(true)

    try {
      console.log("[v0] Agency dashboard fetching all trips")

      const { data: tripsData, error } = await supabase
        .from("trips")
        .select(`
        *,
        owner:users!trips_owner_id_fkey(*),
        collaborators:trip_collaborators(
          *,
          user:users(*)
        )
      `)
        .order("created_at", { ascending: false })

      console.log("[v0] Agency trips query result:", { data: tripsData, error })

      if (error) {
        console.error("[v0] Error fetching trips for agency:", error)
      } else {
        console.log("[v0] Agency fetched trips count:", tripsData?.length || 0)
        console.log("[v0] Agency fetched trips:", tripsData)
      }

      setTrips(tripsData || [])
    } catch (error) {
      console.error("[v0] Error in agency fetchTrips:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      console.log("Agency dashboard mounted for user:", currentUser.id)
      fetchTrips()
    }
  }, [currentUser])

  if (loading || !currentUser) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  const publicTrips = trips.filter((trip) => trip.privacy === "public")
  const totalDestinations = trips.reduce((acc, trip) => acc + trip.destinations.length, 0)
  const upcomingTrips = trips.filter((trip) => trip.start_date && new Date(trip.start_date) > new Date())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agency Dashboard</h1>
        <p className="text-gray-600">Monitor travel plans and discover opportunities</p>
        <Badge variant="secondary" className="mt-2">
          {currentUser.agency_name}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Public Trips</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicTrips.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDestinations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTrips.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Trips */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Trips</h2>
        {trips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600 text-center">No travel plans are currently available to view.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onUpdate={fetchTrips} isAgencyView={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyDashboard

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Trip, TripPrivacy } from "@/lib/types"

interface EditTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip | null
  onTripUpdated: () => void
}

export default function EditTripDialog({ open, onOpenChange, trip, onTripUpdated }: EditTripDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [destinations, setDestinations] = useState<string[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [privacy, setPrivacy] = useState<TripPrivacy>("private")

  const supabase = createClient()

  // Populate form when trip changes
  useEffect(() => {
    if (trip && open) {
      setName(trip.name)
      setDescription(trip.description || "")
      setDestinations(trip.destinations || [])
      setStartDate(trip.start_date || "")
      setEndDate(trip.end_date || "")
      setPrivacy(trip.privacy)
    }
  }, [trip, open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setDestinations([])
      setNewDestination("")
      setStartDate("")
      setEndDate("")
      setPrivacy("private")
    }
  }, [open])

  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations([...destinations, newDestination.trim()])
      setNewDestination("")
    }
  }

  const removeDestination = (destination: string) => {
    setDestinations(destinations.filter((d) => d !== destination))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trip) return

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      console.log("Updating trip:", {
        tripId: trip.id,
        name,
        description,
        destinations,
        startDate,
        endDate,
        privacy,
      })

      const { data: updatedTrip, error } = await supabase
        .from("trips")
        .update({
          name,
          description: description || null,
          destinations,
          start_date: startDate || null,
          end_date: endDate || null,
          privacy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", trip.id)
        .eq("owner_id", user.id) // Ensure user owns the trip
        .select()
        .single()

      if (error) {
        console.error("Error updating trip:", error)
        throw error
      }

      console.log("Trip updated successfully:", updatedTrip)

      toast({
        title: "Trip updated",
        description: "Your trip has been updated successfully.",
      })

      onTripUpdated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update trip",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!trip) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trip</DialogTitle>
          <DialogDescription>Update your trip details and preferences.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Trip Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Europe Trip"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your trip..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Destinations</Label>
              <div className="flex space-x-2">
                <Input
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="Add a destination"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDestination())}
                />
                <Button type="button" onClick={addDestination} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {destinations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {destinations.map((destination) => (
                    <Badge key={destination} variant="secondary" className="flex items-center gap-1">
                      {destination}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeDestination(destination)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input id="edit-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-privacy">Privacy</Label>
              <Select value={privacy} onValueChange={(value: TripPrivacy) => setPrivacy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

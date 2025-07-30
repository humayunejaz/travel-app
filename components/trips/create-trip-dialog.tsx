"use client"

import type React from "react"

import { useState } from "react"
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
import { X, Plus, UserPlus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { sendInvitationEmail } from "@/lib/email-service"
import type { TripPrivacy, CollaboratorRole } from "@/lib/types"

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTripCreated: () => void
}

interface Collaborator {
  email: string
  role: CollaboratorRole
}

export default function CreateTripDialog({ open, onOpenChange, onTripCreated }: CreateTripDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [destinations, setDestinations] = useState<string[]>([])
  const [newDestination, setNewDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [privacy, setPrivacy] = useState<TripPrivacy>("private")

  // New collaborator fields
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("")
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<CollaboratorRole>("viewer")

  const supabase = createClient()

  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations([...destinations, newDestination.trim()])
      setNewDestination("")
    }
  }

  const removeDestination = (destination: string) => {
    setDestinations(destinations.filter((d) => d !== destination))
  }

  const addCollaborator = () => {
    if (newCollaboratorEmail.trim() && !collaborators.find((c) => c.email === newCollaboratorEmail.trim())) {
      setCollaborators([
        ...collaborators,
        {
          email: newCollaboratorEmail.trim(),
          role: newCollaboratorRole,
        },
      ])
      setNewCollaboratorEmail("")
      setNewCollaboratorRole("viewer")
    }
  }

  const removeCollaborator = (email: string) => {
    setCollaborators(collaborators.filter((c) => c.email !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      console.log("Creating trip with collaborators:", collaborators)

      // Create the trip first
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .insert({
          name,
          description: description || null,
          destinations,
          start_date: startDate || null,
          end_date: endDate || null,
          privacy,
          owner_id: user.id,
        })
        .select()
        .single()

      if (tripError) throw tripError

      console.log("Trip created:", tripData)

      // Send invitations to collaborators
      if (collaborators.length > 0) {
        console.log("Sending invitations to:", collaborators.length, "collaborators")

        // Get current user details for email
        const { data: currentUser } = await supabase.from("users").select("full_name").eq("id", user.id).single()

        const invitations = collaborators.map((collaborator) => ({
          trip_id: tripData.id,
          inviter_id: user.id,
          invitee_email: collaborator.email,
          role: collaborator.role,
          status: "pending" as const,
        }))

        const { data: invitationData, error: invitationError } = await supabase
          .from("invitations")
          .insert(invitations)
          .select()

        if (invitationError) {
          console.error("Error creating invitations:", invitationError)
          throw invitationError
        }

        console.log("Invitations created:", invitationData)

        // Send emails for each invitation
        let emailsSent = 0
        let emailsFailed = 0

        for (let i = 0; i < collaborators.length; i++) {
          const collaborator = collaborators[i]
          const invitation = invitationData[i]

          try {
            console.log(`Sending email ${i + 1}/${collaborators.length} to:`, collaborator.email)

            await sendInvitationEmail({
              to: collaborator.email,
              inviterName: currentUser?.full_name || user.email || "Someone",
              tripName: name,
              invitationId: invitation.id,
              role: collaborator.role,
            })

            console.log(`Email sent successfully to:`, collaborator.email)
            emailsSent++
          } catch (emailError) {
            console.error(`Failed to send email to ${collaborator.email}:`, emailError)
            emailsFailed++
          }
        }

        // Show appropriate toast message
        if (emailsSent === collaborators.length) {
          toast({
            title: "Trip created!",
            description: `Trip created and ${emailsSent} invitation email(s) sent successfully!`,
          })
        } else if (emailsSent > 0) {
          toast({
            title: "Trip created",
            description: `Trip created! ${emailsSent} emails sent, ${emailsFailed} failed. Users can still see invitations when they log in.`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Trip created",
            description: `Trip created but email sending failed. Users can still see invitations when they log in.`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Trip created",
          description: "Your trip has been created successfully.",
        })
      }

      // Reset form
      setName("")
      setDescription("")
      setDestinations([])
      setNewDestination("")
      setStartDate("")
      setEndDate("")
      setPrivacy("private")
      setCollaborators([])
      setNewCollaboratorEmail("")
      setNewCollaboratorRole("viewer")

      onTripCreated()
    } catch (error: any) {
      console.error("Error in handleSubmit:", error)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>
            Plan your next adventure. Add destinations, dates, and invite friends to collaborate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Summer Europe Trip"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
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
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
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

            {/* Collaborators Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Collaborators (Optional)
              </Label>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={newCollaboratorEmail}
                  onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCollaborator())}
                />
                <Select
                  value={newCollaboratorRole}
                  onValueChange={(value: CollaboratorRole) => setNewCollaboratorRole(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addCollaborator} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {collaborators.length > 0 && (
                <div className="space-y-2 mt-2">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{collaborator.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {collaborator.role}
                        </Badge>
                      </div>
                      <X
                        className="h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500"
                        onClick={() => removeCollaborator(collaborator.email)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { toast } from "@/hooks/use-toast"
import { sendInvitationEmail } from "@/lib/email-service"
import type { CollaboratorRole } from "@/lib/types"

interface InviteCollaboratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  tripName: string
  onInviteSent: () => void
}

export default function InviteCollaboratorDialog({
  open,
  onOpenChange,
  tripId,
  tripName,
  onInviteSent,
}: InviteCollaboratorDialogProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<CollaboratorRole>("viewer")
  const [message, setMessage] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Get current user details
      const { data: currentUser } = await supabase.from("users").select("full_name").eq("id", user.id).single()

      // Check if user exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from("invitations")
        .select("id")
        .eq("trip_id", tripId)
        .eq("invitee_email", email)
        .eq("status", "pending")
        .single()

      if (existingInvitation) {
        throw new Error("An invitation has already been sent to this email address")
      }

      // Create the invitation
      const { data: invitationData, error } = await supabase
        .from("invitations")
        .insert({
          trip_id: tripId,
          inviter_id: user.id,
          invitee_email: email,
          invitee_id: existingUser?.id || null,
          role,
          message: message || null,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      // Send email invitation using EmailJS
      try {
        const emailResult = await sendInvitationEmail({
          to: email,
          inviterName: currentUser?.full_name || user.email || "Someone",
          tripName: tripName,
          invitationId: invitationData.id,
          message: message,
          role: role,
        })

        console.log("Email sent successfully:", emailResult)

        toast({
          title: "Invitation sent!",
          description: `Email invitation sent to ${email}. They will receive an email with a link to accept.`,
        })
      } catch (emailError) {
        console.error("Email sending failed:", emailError)

        // Still show success since invitation was created
        toast({
          title: "Invitation created",
          description: `Invitation created but email failed to send: ${emailError instanceof Error ? emailError.message : "Unknown error"}. The user can still see it when they log in.`,
          variant: "destructive",
        })
      }

      // Reset form
      setEmail("")
      setRole("viewer")
      setMessage("")

      onInviteSent()
    } catch (error: any) {
      console.error("Error sending invitation:", error)
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Send an email invitation to collaborate on "{tripName}". They'll receive an email with a link to accept.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collaborator@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: CollaboratorRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view trip details</SelectItem>
                  <SelectItem value="editor">Editor - Can edit trip details</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to your invitation..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Email Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

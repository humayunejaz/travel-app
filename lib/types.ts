export type UserRole = "user" | "agency"
export type TripPrivacy = "private" | "public"
export type CollaboratorRole = "admin" | "editor" | "viewer"
export type InvitationStatus = "pending" | "accepted" | "declined"

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  agency_name?: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  name: string
  description?: string
  destinations: string[]
  start_date?: string
  end_date?: string
  privacy: TripPrivacy
  owner_id: string
  created_at: string
  updated_at: string
  owner?: User
  collaborators?: TripCollaborator[]
}

export interface TripCollaborator {
  id: string
  trip_id: string
  user_id: string
  role: CollaboratorRole
  added_by: string
  created_at: string
  user?: User
}

export interface Invitation {
  id: string
  trip_id: string
  inviter_id: string
  invitee_email: string
  invitee_id?: string
  role: CollaboratorRole
  status: InvitationStatus
  message?: string
  created_at: string
  updated_at: string
  trip?: Trip
  inviter?: User
}

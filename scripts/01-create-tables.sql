-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'agency');
CREATE TYPE trip_privacy AS ENUM ('private', 'public');
CREATE TYPE collaborator_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  agency_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  destinations TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  privacy trip_privacy DEFAULT 'private',
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip collaborators table
CREATE TABLE public.trip_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role collaborator_role DEFAULT 'viewer',
  added_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Invitations table
CREATE TABLE public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role collaborator_role DEFAULT 'viewer',
  status invitation_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for trips table
CREATE POLICY "Users can view their own trips" ON public.trips
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT trip_id FROM public.trip_collaborators WHERE user_id = auth.uid()) OR
    (privacy = 'public' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'agency'))
  );

CREATE POLICY "Users can create trips" ON public.trips
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Trip owners can update their trips" ON public.trips
  FOR UPDATE USING (
    owner_id = auth.uid() OR 
    id IN (SELECT trip_id FROM public.trip_collaborators WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Trip owners can delete their trips" ON public.trips
  FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for trip_collaborators table
CREATE POLICY "Users can view collaborators of their trips" ON public.trip_collaborators
  FOR SELECT USING (
    trip_id IN (SELECT id FROM public.trips WHERE owner_id = auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Trip owners can manage collaborators" ON public.trip_collaborators
  FOR ALL USING (
    trip_id IN (SELECT id FROM public.trips WHERE owner_id = auth.uid())
  );

-- RLS Policies for invitations table
CREATE POLICY "Users can view their invitations" ON public.invitations
  FOR SELECT USING (
    inviter_id = auth.uid() OR 
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations for their trips" ON public.invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() AND
    trip_id IN (SELECT id FROM public.trips WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update their invitations" ON public.invitations
  FOR UPDATE USING (
    inviter_id = auth.uid() OR 
    invitee_id = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX idx_trips_owner_id ON public.trips(owner_id);
CREATE INDEX idx_trip_collaborators_trip_id ON public.trip_collaborators(trip_id);
CREATE INDEX idx_trip_collaborators_user_id ON public.trip_collaborators(user_id);
CREATE INDEX idx_invitations_invitee_email ON public.invitations(invitee_email);
CREATE INDEX idx_invitations_invitee_id ON public.invitations(invitee_id);

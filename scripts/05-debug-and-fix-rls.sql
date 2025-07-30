-- Let's check what's in the trips table
SELECT id, name, owner_id, created_at FROM public.trips;

-- Check what's in the users table
SELECT id, email, full_name FROM public.users;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('trips', 'users', 'trip_collaborators', 'invitations');

-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
-- ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

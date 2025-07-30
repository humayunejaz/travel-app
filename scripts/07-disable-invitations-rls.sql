-- Temporarily disable RLS for invitations to test
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;

-- Check what invitations exist
SELECT * FROM public.invitations;

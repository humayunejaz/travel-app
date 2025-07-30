-- Make sure all RLS is disabled for testing
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_collaborators DISABLE ROW LEVEL SECURITY;

-- Check existing data with proper type casting
SELECT 'TRIPS' as table_name, id::text as id, name as detail1, owner_id::text as detail2 FROM public.trips
UNION ALL
SELECT 'INVITATIONS' as table_name, id::text as id, invitee_email as detail1, inviter_id::text as detail2 FROM public.invitations
UNION ALL  
SELECT 'COLLABORATORS' as table_name, id::text as id, user_id::text as detail1, trip_id::text as detail2 FROM public.trip_collaborators;

-- Clean up any orphaned data
DELETE FROM public.invitations WHERE trip_id NOT IN (SELECT id FROM public.trips);
DELETE FROM public.trip_collaborators WHERE trip_id NOT IN (SELECT id FROM public.trips);

-- Show current state
SELECT COUNT(*) as invitation_count FROM public.invitations;
SELECT COUNT(*) as collaborator_count FROM public.trip_collaborators;
SELECT COUNT(*) as trip_count FROM public.trips;

-- Disable RLS for invitations table temporarily to test
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;

-- Check what's in the invitations table
SELECT id, inviter_id, invitee_email, invitee_id, status FROM public.invitations;

-- Re-enable RLS with a simpler policy
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Drop the existing policy and create a simpler one
DROP POLICY IF EXISTS "Users can view their invitations" ON public.invitations;

CREATE POLICY "Users can view their invitations" ON public.invitations
  FOR SELECT USING (
    inviter_id = auth.uid() OR 
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

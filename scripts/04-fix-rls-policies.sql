-- Drop existing policies and recreate them with better logic
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can view collaborators of their trips" ON public.trip_collaborators;

-- Recreate the trips policy with simpler logic
CREATE POLICY "Users can view accessible trips" ON public.trips
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT trip_id FROM public.trip_collaborators WHERE user_id = auth.uid()) OR
    (privacy = 'public' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'agency'))
  );

-- Recreate the collaborators policy
CREATE POLICY "Users can view trip collaborators" ON public.trip_collaborators
  FOR SELECT USING (
    user_id = auth.uid() OR
    trip_id IN (SELECT id FROM public.trips WHERE owner_id = auth.uid())
  );

-- Also ensure users can view other users for the joins
DROP POLICY IF EXISTS "Users can view other users" ON public.users;
CREATE POLICY "Users can view other users" ON public.users
  FOR SELECT USING (true);

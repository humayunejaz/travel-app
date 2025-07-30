-- Insert sample agency user (you'll need to create this user in Supabase Auth first)
-- This is just for demonstration - in production, agencies would sign up normally
INSERT INTO public.users (id, email, full_name, role, agency_name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'agency@example.com', 'Travel Pro Agency', 'agency', 'Travel Pro Agency')
ON CONFLICT (id) DO NOTHING;

-- Note: Regular users will be created automatically via the trigger when they sign up

-- First, let's see what we have
SELECT 'ACCEPTED INVITATIONS' as type, COUNT(*) as count FROM invitations WHERE status = 'accepted';
SELECT 'COLLABORATORS' as type, COUNT(*) as count FROM trip_collaborators;

-- Show accepted invitations that don't have corresponding collaborators
SELECT 
  i.id as invitation_id,
  i.trip_id,
  i.invitee_email,
  i.invitee_id,
  i.role,
  t.name as trip_name,
  CASE 
    WHEN tc.id IS NULL THEN 'MISSING COLLABORATOR'
    ELSE 'HAS COLLABORATOR'
  END as status
FROM invitations i
JOIN trips t ON i.trip_id = t.id
LEFT JOIN trip_collaborators tc ON (tc.trip_id = i.trip_id AND tc.user_id = i.invitee_id)
WHERE i.status = 'accepted';

-- Fix any accepted invitations that don't have collaborator records
INSERT INTO trip_collaborators (trip_id, user_id, role, added_by)
SELECT 
  i.trip_id,
  i.invitee_id,
  i.role,
  i.inviter_id
FROM invitations i
LEFT JOIN trip_collaborators tc ON (tc.trip_id = i.trip_id AND tc.user_id = i.invitee_id)
WHERE i.status = 'accepted' 
  AND i.invitee_id IS NOT NULL 
  AND tc.id IS NULL;

-- Show the results
SELECT 
  t.name as trip_name,
  COUNT(tc.id) as collaborator_count,
  COUNT(tc.id) + 1 as total_members
FROM trips t
LEFT JOIN trip_collaborators tc ON t.id = tc.trip_id
GROUP BY t.id, t.name
ORDER BY t.name;

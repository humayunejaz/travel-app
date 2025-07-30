-- Check what collaborators exist in the database
SELECT 
  t.name as trip_name,
  t.id as trip_id,
  tc.user_id,
  tc.role,
  u.email as collaborator_email
FROM trips t
LEFT JOIN trip_collaborators tc ON t.id = tc.trip_id
LEFT JOIN users u ON tc.user_id = u.id
ORDER BY t.name;

-- Also check invitations that have been accepted
SELECT 
  t.name as trip_name,
  i.invitee_email,
  i.status,
  i.role
FROM trips t
JOIN invitations i ON t.id = i.trip_id
WHERE i.status = 'accepted'
ORDER BY t.name;

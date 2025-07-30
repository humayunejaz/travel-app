-- Check all invitations
SELECT 
  'INVITATIONS' as type,
  i.id,
  t.name as trip_name,
  i.invitee_email,
  i.status,
  i.role,
  i.created_at
FROM invitations i
JOIN trips t ON i.trip_id = t.id
ORDER BY i.created_at DESC;

-- Check all collaborators  
SELECT 
  'COLLABORATORS' as type,
  tc.id,
  t.name as trip_name,
  u.email as collaborator_email,
  tc.role,
  tc.created_at
FROM trip_collaborators tc
JOIN trips t ON tc.trip_id = t.id
JOIN users u ON tc.user_id = u.id
ORDER BY tc.created_at DESC;

-- Count by trip
SELECT 
  t.name as trip_name,
  COUNT(tc.id) as collaborator_count
FROM trips t
LEFT JOIN trip_collaborators tc ON t.id = tc.trip_id
GROUP BY t.id, t.name
ORDER BY t.name;

USE coaching_db;

SELECT id, name, email, role
FROM users
ORDER BY id DESC;

SELECT id, event_type, user_id, user_name, email, role, ip_address, created_at
FROM auth_events
ORDER BY created_at DESC, id DESC;

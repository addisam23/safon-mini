-- Create default admin account
-- Email: addisaschale3@gmail.com
-- Password: Addis2379

INSERT INTO users (
  id, 
  email, 
  name, 
  password, 
  role, 
  referral_code, 
  is_verified,
  created_at, 
  updated_at
)
VALUES (
  'admin-default-001',
  'addisaschale3@gmail.com',
  'Default Admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2', -- Password: Addis2379
  'admin',
  'ADMIN001',
  true,
  NOW(),
  NOW()
) 
ON CONFLICT (email) DO UPDATE SET
  password = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9S2',
  role = 'admin',
  is_verified = true,
  updated_at = NOW();

-- Verify the admin account was created
SELECT id, email, name, role, is_verified, created_at 
FROM users 
WHERE email = 'addisaschale3@gmail.com';

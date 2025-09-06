-- Insert admin user record
INSERT INTO public.users (id, email, role) 
VALUES (
  '3e41ebd7-5652-41e2-89e9-6542b199a6f5',
  'pawelhuryn@gmail.com',
  'Admin'
) ON CONFLICT (id) DO UPDATE SET 
  role = 'Admin',
  email = 'pawelhuryn@gmail.com';
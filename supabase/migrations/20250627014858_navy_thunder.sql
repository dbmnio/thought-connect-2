/*
  # Fix user signup trigger

  1. Database Functions
    - Create or replace the `handle_new_user` trigger function
    - Ensures proper profile creation on user signup
    - Creates a default personal team for new users
    - Adds user as owner of their personal team

  2. Triggers
    - Ensure trigger is properly attached to auth.users table
    - Trigger fires after user insertion in auth.users

  3. Security
    - Function runs with security definer privileges
    - Bypasses RLS for initial user setup
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_team_id uuid;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create a default personal team
  INSERT INTO public.teams (name, created_by)
  VALUES ('Personal', new.id)
  RETURNING id INTO new_team_id;

  -- Add user as owner of their personal team
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, new.id, 'owner');

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
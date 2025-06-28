-- Update RLS policies to allow team members to read thoughts and team details.
-- This is necessary for the cross-team search functionality to work correctly.

-- 1. Drop the old, restrictive SELECT policies
DROP POLICY IF EXISTS "Users can read own teams" ON public.teams;
DROP POLICY IF EXISTS "Users can read own thoughts" ON public.thoughts;

-- 2. Create a helper function to check for team membership.
-- This avoids repeating the same subquery in multiple policies, which is better for maintenance.
CREATE OR REPLACE FUNCTION is_team_member(team_id_to_check uuid, user_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members
    WHERE team_id = team_id_to_check AND user_id = user_id_to_check
  );
$$;


-- 3. Create new SELECT policy for the 'teams' table
CREATE POLICY "Users can read teams they are members of"
  ON public.teams
  FOR SELECT
  TO authenticated
  USING (is_team_member(id, auth.uid()));

-- 4. Create new SELECT policy for the 'thoughts' table
CREATE POLICY "Users can read thoughts from teams they are members of"
  ON public.thoughts
  FOR SELECT
  TO authenticated
  USING (is_team_member(team_id, auth.uid())); 
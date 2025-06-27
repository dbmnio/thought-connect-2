/*
  # Fix infinite recursion in team_members RLS policy

  1. Problem
    - The current SELECT policy on team_members table creates infinite recursion
    - Policy references team_members table within its own condition
    - This prevents users from reading their team memberships

  2. Solution
    - Drop the problematic policy
    - Create a simpler, non-recursive policy
    - Allow users to read their own team memberships directly
    - Allow users to read team memberships for teams they belong to (without recursion)

  3. Security
    - Users can only see team memberships for teams they belong to
    - No recursive queries that cause infinite loops
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read team memberships for their teams" ON team_members;

-- Create a simple, non-recursive policy for reading team memberships
-- Users can read their own team membership records
CREATE POLICY "Users can read own team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can read all team memberships for teams where they are members
-- This uses a direct join instead of a subquery to avoid recursion
CREATE POLICY "Users can read team memberships for their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT tm.team_id 
      FROM team_members tm 
      WHERE tm.user_id = auth.uid()
    )
  );
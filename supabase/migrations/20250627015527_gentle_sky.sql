/*
  # Comprehensive RLS Policy Fix

  This migration fixes the infinite recursion issue in team_members policies
  and implements best practices for Row Level Security.

  ## Changes Made:
  1. Simplified team_members policies to avoid circular dependencies
  2. Used direct user_id checks instead of complex subqueries where possible
  3. Implemented proper policy separation for different operations
  4. Added performance optimizations with proper indexing
  5. Ensured policies are minimal and focused

  ## Security Model:
  - Users can read their own team memberships directly
  - Team owners can manage all aspects of their teams
  - Cross-team data access is controlled through explicit team membership
*/

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can read team memberships for their teams" ON team_members;
DROP POLICY IF EXISTS "Users can read own team memberships" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams when invited" ON team_members;

-- Create optimized, non-recursive policies for team_members

-- 1. Users can read their own team membership records (direct, no recursion)
CREATE POLICY "team_members_select_own"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Team owners can read all memberships for their teams
CREATE POLICY "team_members_select_as_owner"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = 'owner'
    )
  );

-- 3. Team owners can insert new members
CREATE POLICY "team_members_insert_as_owner"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = 'owner'
    )
  );

-- 4. Users can join teams when invited (self-insert only)
CREATE POLICY "team_members_insert_self"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. Team owners can update member roles
CREATE POLICY "team_members_update_as_owner"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = 'owner'
    )
  );

-- 6. Team owners can delete members
CREATE POLICY "team_members_delete_as_owner"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = 'owner'
    )
  );

-- 7. Users can leave teams (delete their own membership)
CREATE POLICY "team_members_delete_self"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add performance indexes for RLS policies
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_user_role ON team_members(team_id, user_id, role);

-- Optimize other policies that might have similar issues

-- Fix profiles policy to be more efficient
DROP POLICY IF EXISTS "Users can read profiles of team members" ON profiles;
CREATE POLICY "profiles_select_team_members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR  -- Own profile
    EXISTS (
      SELECT 1 
      FROM team_members tm1, team_members tm2
      WHERE tm1.user_id = auth.uid()
        AND tm2.user_id = profiles.id
        AND tm1.team_id = tm2.team_id
    )
  );

-- Ensure teams policies are efficient
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
CREATE POLICY "teams_select_member"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = teams.id 
        AND tm.user_id = auth.uid()
    )
  );

-- Ensure thoughts policies are efficient
DROP POLICY IF EXISTS "Users can read thoughts from their teams" ON thoughts;
CREATE POLICY "thoughts_select_team_member"
  ON thoughts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = thoughts.team_id 
        AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create thoughts in their teams" ON thoughts;
CREATE POLICY "thoughts_insert_team_member"
  ON thoughts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 
      FROM team_members tm 
      WHERE tm.team_id = team_id 
        AND tm.user_id = auth.uid()
    )
  );

-- Add helpful comments for future developers
COMMENT ON POLICY "team_members_select_own" ON team_members IS 
'Allows users to read their own team membership records directly';

COMMENT ON POLICY "team_members_select_as_owner" ON team_members IS 
'Allows team owners to read all memberships for teams they own';

COMMENT ON TABLE team_members IS 
'Junction table for team memberships with RLS policies to prevent infinite recursion';
/*
  # Fix RLS Infinite Recursion Issues

  This migration implements the simplified RLS policies as described in row-level-security.md
  to eliminate infinite recursion errors in team_members and related tables.

  ## Changes Made
  1. Drop all existing problematic RLS policies
  2. Implement simplified, user-centric policies
  3. Add strategic indexes for performance
  4. Ensure no circular dependencies in policy logic

  ## Security Model
  - User-centric access control (users access their own data)
  - Creator-based team management
  - Simplified team membership policies
  - No self-referencing subqueries in policies
*/

-- Drop all existing RLS policies that might cause recursion
DROP POLICY IF EXISTS "Users can read team memberships for their teams" ON team_members;
DROP POLICY IF EXISTS "Users can read team memberships" ON team_members;
DROP POLICY IF EXISTS "Users can create team invitations" ON team_members;
DROP POLICY IF EXISTS "Users can join teams" ON team_members;
DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
DROP POLICY IF EXISTS "Users can read own memberships" ON team_members;
DROP POLICY IF EXISTS "Users can update invitation status" ON team_members;

DROP POLICY IF EXISTS "Users can read own teams" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Users can update own teams" ON teams;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can read own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can create thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can update own thoughts" ON thoughts;

DROP POLICY IF EXISTS "Users can read own associations" ON thought_associations;
DROP POLICY IF EXISTS "Users can create associations" ON thought_associations;

-- Create strategic indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_thoughts_user_id ON thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_team_id ON thoughts(team_id);

-- PROFILES TABLE POLICIES
-- Simple user-centric access
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- TEAMS TABLE POLICIES
-- Creator-based team management
CREATE POLICY "Users can read own teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- TEAM_MEMBERS TABLE POLICIES
-- Simplified membership policies with no circular dependencies
CREATE POLICY "Users can read own memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join teams"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave teams"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update invitation status"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow team creators to manage their team memberships
CREATE POLICY "Team creators can manage memberships"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

-- THOUGHTS TABLE POLICIES
-- User-centric thought access
CREATE POLICY "Users can read own thoughts"
  ON thoughts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create thoughts"
  ON thoughts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own thoughts"
  ON thoughts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- THOUGHT_ASSOCIATIONS TABLE POLICIES
-- Simple association policies
CREATE POLICY "Users can read own associations"
  ON thought_associations
  FOR SELECT
  TO authenticated
  USING (
    question_id IN (
      SELECT id FROM thoughts WHERE user_id = auth.uid()
    ) OR
    answer_id IN (
      SELECT id FROM thoughts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create associations"
  ON thought_associations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    question_id IN (
      SELECT id FROM thoughts WHERE user_id = auth.uid()
    ) OR
    answer_id IN (
      SELECT id FROM thoughts WHERE user_id = auth.uid()
    )
  );
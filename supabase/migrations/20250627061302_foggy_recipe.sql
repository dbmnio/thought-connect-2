/*
  # Enhanced Team Management System

  1. Database Schema Updates
    - Add invitation_status to team_members table
    - Add team metadata fields (description, avatar_url, member_limit)
    - Add indexes for performance optimization
    - Update RLS policies for invitation workflows

  2. Security
    - Enhanced RLS policies for invitation system
    - Permission-based access control
    - Secure invitation workflow
*/

-- Add invitation status to team_members table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'invitation_status'
  ) THEN
    ALTER TABLE team_members ADD COLUMN invitation_status TEXT DEFAULT 'accepted';
    ALTER TABLE team_members ADD CONSTRAINT invitation_status_check 
      CHECK (invitation_status IN ('pending', 'accepted', 'declined'));
  END IF;
END $$;

-- Add team metadata fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'description'
  ) THEN
    ALTER TABLE teams ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE teams ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teams' AND column_name = 'member_limit'
  ) THEN
    ALTER TABLE teams ADD COLUMN member_limit INTEGER DEFAULT 50;
  END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_team_members_invitation_status 
  ON team_members(invitation_status);
CREATE INDEX IF NOT EXISTS idx_team_members_composite 
  ON team_members(team_id, user_id, invitation_status);
CREATE INDEX IF NOT EXISTS idx_team_members_pending_invitations 
  ON team_members(user_id, invitation_status) WHERE invitation_status = 'pending';

-- Enhanced RLS policies for invitation system
DROP POLICY IF EXISTS "Users can create team invitations" ON team_members;
CREATE POLICY "Users can create team invitations"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can invite others to teams they own
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
    OR
    -- Users can accept their own invitations
    (user_id = auth.uid() AND invitation_status = 'pending')
  );

DROP POLICY IF EXISTS "Users can update invitation status" ON team_members;
CREATE POLICY "Users can update invitation status"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own invitation status
    user_id = auth.uid()
    OR
    -- Team owners can update member status
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can read team memberships" ON team_members;
CREATE POLICY "Users can read team memberships"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own memberships
    user_id = auth.uid()
    OR
    -- Users can see memberships of teams they own
    team_id IN (
      SELECT id FROM teams WHERE created_by = auth.uid()
    )
    OR
    -- Users can see accepted memberships of teams they're part of
    (invitation_status = 'accepted' AND team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND invitation_status = 'accepted'
    ))
  );
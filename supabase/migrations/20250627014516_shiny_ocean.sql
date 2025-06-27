/*
  # Complete Database Schema Setup

  1. New Tables
    - `profiles` - User profile information
    - `teams` - Team/workspace management
    - `team_members` - Team membership with roles
    - `thoughts` - Questions, answers, and documents
    - `thought_associations` - Links between questions and answers

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Secure user creation trigger

  3. Features
    - Automatic profile and personal team creation on signup
    - Role-based access control
    - Thought categorization and associations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE thought_type AS ENUM ('question', 'answer', 'document');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE thought_status AS ENUM ('open', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE association_status AS ENUM ('confirmed', 'pending', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  type thought_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  status thought_status DEFAULT 'open',
  parent_question_id uuid REFERENCES thoughts(id) ON DELETE SET NULL,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create thought_associations table
CREATE TABLE IF NOT EXISTS thought_associations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id uuid REFERENCES thoughts(id) ON DELETE CASCADE NOT NULL,
  answer_id uuid REFERENCES thoughts(id) ON DELETE CASCADE NOT NULL,
  status association_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, answer_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE thought_associations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read profiles of team members" ON profiles;
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update teams" ON teams;
DROP POLICY IF EXISTS "Users can read team memberships for their teams" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can join teams when invited" ON team_members;
DROP POLICY IF EXISTS "Users can read thoughts from their teams" ON thoughts;
DROP POLICY IF EXISTS "Users can create thoughts in their teams" ON thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can read associations for thoughts in their teams" ON thought_associations;
DROP POLICY IF EXISTS "Users can create associations for thoughts in their teams" ON thought_associations;

-- Profiles policies
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

CREATE POLICY "Users can read profiles of team members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tm.user_id
      FROM team_members tm
      WHERE tm.team_id IN (
        SELECT team_id
        FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Teams policies
CREATE POLICY "Users can read teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team owners can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Team members policies
CREATE POLICY "Users can read team memberships for their teams"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Users can join teams when invited"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Thoughts policies
CREATE POLICY "Users can read thoughts from their teams"
  ON thoughts
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create thoughts in their teams"
  ON thoughts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own thoughts"
  ON thoughts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Thought associations policies
CREATE POLICY "Users can read associations for thoughts in their teams"
  ON thought_associations
  FOR SELECT
  TO authenticated
  USING (
    question_id IN (
      SELECT id
      FROM thoughts
      WHERE team_id IN (
        SELECT team_id
        FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create associations for thoughts in their teams"
  ON thought_associations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    question_id IN (
      SELECT id
      FROM thoughts
      WHERE team_id IN (
        SELECT team_id
        FROM team_members
        WHERE user_id = auth.uid()
      )
    ) AND
    answer_id IN (
      SELECT id
      FROM thoughts
      WHERE team_id IN (
        SELECT team_id
        FROM team_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_thoughts_updated_at ON thoughts;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thoughts_updated_at
  BEFORE UPDATE ON thoughts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  team_id_var uuid;
BEGIN
  -- Insert profile first
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Create personal team and get the ID
  INSERT INTO teams (name, created_by)
  VALUES ('Personal', NEW.id)
  RETURNING id INTO team_id_var;
  
  -- Add user to personal team as owner
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (team_id_var, NEW.id, 'owner');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
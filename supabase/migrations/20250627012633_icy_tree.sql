/*
  # Initial Schema Setup for ThoughtSpace

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references profiles)
      - `role` (enum: owner, member)
      - `joined_at` (timestamp)
    
    - `thoughts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `team_id` (uuid, references teams)
      - `type` (enum: question, answer, document)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `status` (enum: open, closed)
      - `parent_question_id` (uuid, optional, references thoughts)
      - `upvotes` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `thought_associations`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references thoughts)
      - `answer_id` (uuid, references thoughts)
      - `status` (enum: confirmed, pending, rejected)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for team-based access control
    - Add policies for thought visibility within teams

  3. Functions
    - Auto-create profile on user signup
    - Auto-create personal team on user signup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'member');
CREATE TYPE thought_type AS ENUM ('question', 'answer', 'document');
CREATE TYPE thought_status AS ENUM ('open', 'closed');
CREATE TYPE association_status AS ENUM ('confirmed', 'pending', 'rejected');

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

-- Functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  
  -- Create personal team
  INSERT INTO teams (name, created_by)
  VALUES ('Personal', NEW.id);
  
  -- Add user to personal team as owner
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (
    (SELECT id FROM teams WHERE name = 'Personal' AND created_by = NEW.id),
    NEW.id,
    'owner'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
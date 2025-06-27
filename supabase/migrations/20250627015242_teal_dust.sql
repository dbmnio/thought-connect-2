/*
  # Fix infinite recursion in team_members RLS policy

  1. Problem
    - The "Users can read team memberships for their teams" policy creates infinite recursion
    - Policy references team_members table within its own policy condition
    - This causes a circular dependency when Supabase evaluates the policy

  2. Solution
    - Drop the problematic policy that causes recursion
    - Keep the simpler, non-recursive policy for users to read their own memberships
    - The existing "Users can read own team memberships" policy is sufficient for most use cases
    - Team owners can still manage members through the separate "Team owners can manage team members" policy

  3. Security
    - Users can still read their own team memberships via "Users can read own team memberships" policy
    - Team owners retain full management capabilities via existing policy
    - No security is compromised by removing the recursive policy
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can read team memberships for their teams" ON team_members;

-- The remaining policies are sufficient:
-- 1. "Users can read own team memberships" (user_id = uid())
-- 2. "Team owners can manage team members" (for management operations)
-- 3. "Users can join teams when invited" (for INSERT operations)
-- This policy allows authenticated users to insert a new thought into the 'thoughts' table
-- if they are a member of the team associated with that thought.

CREATE POLICY "Users can create thoughts for teams they are members of"
  ON public.thoughts
  FOR INSERT
  TO authenticated
  WITH CHECK (is_team_member(team_id, auth.uid()));

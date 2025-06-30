-- Create vector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- drop the function
DROP FUNCTION match_thoughts(vector,uuid[],double precision,integer)

-- This function searches for thoughts based on a query embedding and team filters.
-- It is designed to be called from a Supabase Edge Function.
CREATE OR REPLACE FUNCTION match_thoughts (
  query_embedding vector(1536), -- Matches OpenAI's text-embedding-ada-002 model
  team_ids uuid[],
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  team_id uuid,
  type thought_type,
  title text,
  description text,
  ai_description text,
  created_at timestamptz,
  author_full_name text,
  author_avatar_url text,
  team_name text,
  answer_count bigint,
  similarity float,
  status text,
  image_url text,
  author_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.user_id,
    t.team_id,
    t.type,
    t.title,
    t.description,
    t.ai_description,
    t.created_at,
    p.full_name AS author_full_name,
    p.avatar_url AS author_avatar_url,
    teams.name AS team_name,
    (
        SELECT COUNT(*)
        FROM thought_associations ta
        WHERE ta.question_id = t.id
    ) AS answer_count,
    1 - (t.embedding <=> query_embedding) AS similarity,
    t.status::text,
    t.image_url,
    p.full_name as author_name
  FROM
    thoughts t
  JOIN
    profiles p ON t.user_id = p.id
  JOIN
    teams ON t.team_id = teams.id
  WHERE
    t.team_id = ANY(team_ids) AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$; 
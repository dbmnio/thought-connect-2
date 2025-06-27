import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.17.0";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

serve(async (req) => {
  try {
    const { query, teamIds } = await req.json();

    if (!query || !teamIds || !Array.isArray(teamIds)) {
      return new Response("Missing required parameters: query and teamIds.", { status: 400 });
    }

    // 1. Embed the user's query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });
    const query_embedding = embeddingResponse.data[0].embedding;

    // 2. Query Supabase for nearby results
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data, error } = await supabaseClient.rpc("match_thoughts", {
      query_embedding,
      team_ids: teamIds,
      match_threshold: 0.7, // Adjust as needed
      match_count: 10,       // Adjust as needed
    });

    if (error) throw error;

    return new Response(JSON.stringify({ thoughts: data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 
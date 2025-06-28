// @deno-types="npm:@supabase/functions-js/src/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import OpenAI from 'https://esm.sh/openai@4.24.1';
import { serve } from 'https://deno.land/std@0.224.0/http/mod.ts';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:8081';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, teamIds } = await req.json();
    console.log('request: ', query, JSON.stringify(teamIds));

    if (!query || !teamIds || !Array.isArray(teamIds)) {
      return new Response('Missing required parameters: query and teamIds.', {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Embed the user's query
    console.log('Embedding query');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    console.log('embeddingResponse', JSON.stringify(embeddingResponse));
    const query_embedding = embeddingResponse.data[0].embedding;

    // 2. Query Supabase for nearby results
    console.log('Querying Supabase');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    console.log('supabase rpc call');
    const { data, error } = await supabaseClient.rpc('match_thoughts', {
      query_embedding,
      team_ids: teamIds,
      match_threshold: 0.7, // Adjust as needed
      match_count: 10, // Adjust as needed
    });

    if (error) throw error;

    console.log('data', JSON.stringify(data));
    return new Response(JSON.stringify({ thoughts: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in search-thoughts:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://deno.land/x/openai/mod.ts';

const openAIKey = Deno.env.get('OPENAI_API_KEY');
const openai = new OpenAI(openAIKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, teamIds } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 1. Generate embedding for the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });
    const query_embedding = embeddingResponse.data[0].embedding;

    // 2. Retrieve relevant context from the database
    const { data: documents, error } = await supabaseClient.rpc('search_thoughts', {
      query_embedding,
      match_threshold: 0.7,
      match_count: 5,
      team_ids: teamIds,
    });

    if (error) throw error;

    const contextText = documents.map((doc: any) => doc.content).join('\n---\n');

    // 3. Construct the prompt with retrieved context
    const prompt = `
      You are a helpful AI assistant for the ThoughtConnect app. 
      Answer the user's question based on the following context provided from their team's knowledge base.
      Your answer should be concise and directly based on the provided context. If the context does not contain the answer, state that you couldn't find an answer in the knowledge base.

      Context:
      ${contextText}

      Question:
      ${question}
    `;

    // 4. Generate and stream the response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
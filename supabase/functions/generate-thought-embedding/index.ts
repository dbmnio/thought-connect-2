// @deno-types="npm:@supabase/functions-js/src/edge-runtime.d.ts"
console.log('Entered file');
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
console.log('Imported supabase-js');
import OpenAI from 'https://esm.sh/openai@4.24.1';
console.log('Imported openai');
import { serve } from 'https://deno.land/std@0.224.0/http/mod.ts';
console.log('Imported std/http');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
console.log('Initialized OpenAI client');

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
console.log('Initialized Supabase admin client');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

/**
 * This function handles the generation of AI-based descriptions and embeddings for thoughts.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Response} - The response from the function.
 */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let thought_id: string | null = null;
  try {
    const body = await req.json();
    thought_id = body.thought_id;
    if (!thought_id) {
      throw new Error('thought_id is required');
    }

    // 1. Update thought status to 'processing'
    console.log('Updating thought status to processing');
    await supabaseAdmin
      .from('thoughts')
      .update({ embedding_status: 'processing' })
      .eq('id', thought_id);

    // 2. Fetch the thought to get the image URL
    console.log('Fetching thought to get image URL');
    const { data: thought, error: thoughtError } = await supabaseAdmin
      .from('thoughts')
      .select('image_url')
      .eq('id', thought_id)
      .single();

    if (thoughtError || !thought) {
      throw new Error('Failed to fetch thought or thought not found');
    }

    if (!thought.image_url) {
      throw new Error('Thought does not have an image_url');
    }

    const imageUrl = thought.image_url;

    // 3. Generate AI description from the image
    console.log('Generating AI description from the image');
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Provide a detailed, concise description of this image.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const ai_description = visionResponse.choices[0]?.message?.content?.trim() ?? '';

    if (!ai_description) {
      throw new Error('Failed to generate AI description.');
    }

    // 4. Generate embedding for the description
    console.log('Generating embedding for the description');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: ai_description,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // 5. Update thought with description, embedding, and 'completed' status
    console.log('Updating thought with description, embedding, and completed status');
    await supabaseAdmin
      .from('thoughts')
      .update({
        ai_description,
        embedding,
        embedding_status: 'completed',
      })
      .eq('id', thought_id);

    console.log('Successfully generated embedding and updated thought');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in generate-thought-embedding:', error);
    
    // Error handling: update status to 'failed'
    if (thought_id) {
      await supabaseAdmin
        .from('thoughts')
        .update({ embedding_status: 'failed' })
        .eq('id', thought_id);
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
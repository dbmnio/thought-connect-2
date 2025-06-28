// @deno-types="npm:@supabase/functions-js/src/edge-runtime.d.ts"
console.log('Entered file');
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
console.log('Imported supabase-js');
import OpenAI from 'https://esm.sh/openai@4.24.1';
console.log('Imported openai');
import { serve } from 'https://deno.land/std@0.224.0/http/mod.ts';
console.log('Imported std/http');
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts';
console.log('Imported std/encoding/base64');

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

    // First, fetch the thought to check its current status
    const { data: initialThought, error: initialError } = await supabaseAdmin
      .from('thoughts')
      .select('embedding_status')
      .eq('id', thought_id)
      .single();

    if (initialError) {
      throw new Error(`Failed to fetch thought: ${initialError.message}`);
    }

    // If the embedding is already processed or in progress, exit early.
    if (initialThought.embedding_status === 'completed' || initialThought.embedding_status === 'processing' || initialThought.embedding_status === 'failed') {
      console.log(`Embedding for thought ${thought_id} is already processed, in progress, or failed. Exiting.`);
      return new Response(JSON.stringify({ success: true, message: `Embedding status is already '${initialThought.embedding_status}'.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
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
    const filePath = imageUrl.substring(imageUrl.lastIndexOf('thoughts-images/') + 'thoughts-images/'.length);

    // 3. Download image from Supabase Storage
    console.log('Downloading image from storage');
    const { data: imageBlob, error: downloadError } = await supabaseAdmin.storage
        .from('thoughts-images')
        .download(filePath);
    
    if (downloadError || !imageBlob) {
        throw new Error('Failed to download image from storage');
    }

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const imageBase64 = encodeBase64(arrayBuffer);

    // 4. Generate AI description from the image
    console.log('Generating AI description from the image');
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Provide a detailed, concise description of this image.' },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/jpeg;base64,${imageBase64}` 
              } 
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const ai_description = visionResponse.choices[0]?.message?.content?.trim() ?? '';

    if (!ai_description) {
      throw new Error('Failed to generate AI description.');
    }

    // 5. Generate embedding for the description
    console.log('Generating embedding for the description');
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: ai_description,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // 6. Update thought with description, embedding, and 'completed' status
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
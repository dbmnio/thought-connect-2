/**
 * @file This file contains the API client for interacting with the AI chat service.
 */
import { supabase } from '@/lib/supabase';

/**
 * The name of the Supabase Edge Function for the AI chat.
 */
const AI_FUNCTION_NAME = 'ask-ai';

interface AskQuestionParams {
  question: string;
  teamIds: string[];
  onStreamUpdate: (chunk: string) => void;
  onStreamEnd: () => void;
  onError: (error: Error) => void;
}

/**
 * Sends a question to the AI and streams the response back via callbacks.
 *
 * @param params - The parameters for asking a question.
 */
export async function askQuestion({
  question,
  teamIds,
  onStreamUpdate,
  onStreamEnd,
  onError,
}: AskQuestionParams): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke(AI_FUNCTION_NAME, {
      body: { question, teamIds },
    });

    if (error) throw error;
    if (!data.body) throw new Error('No response body from AI.');

    const reader = data.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const eventMessages = chunk.split('\n\n').filter(Boolean);

        for (const eventMessage of eventMessages) {
          if (eventMessage.startsWith('data: ')) {
            const data = eventMessage.substring(6);
            if (data === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onStreamUpdate(content);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error asking question:', err);
    onError(err instanceof Error ? err : new Error('An unknown error occurred.'));
  } finally {
    onStreamEnd();
  }
} 
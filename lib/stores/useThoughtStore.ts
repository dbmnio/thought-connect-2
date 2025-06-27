import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';

type Thought = Database['public']['Tables']['thoughts']['Row'] & {
  author_name: string;
  team_name: string;
  answer_count: number;
  time_ago: string;
  ai_description: string | null;
  embedding_status: string | null;
};

interface ThoughtState {
  thoughts: Thought[];
  loading: boolean;
  fetchThoughts: (teamIds: string[]) => Promise<void>;
  createThought: (
    thoughtData: {
      type: 'question' | 'answer' | 'document';
      title: string;
      description: string;
      imageUrl: string;
      parentQuestionId?: string;
    },
    user: any, 
    teamId: string
  ) => Promise<any>;
  retryEmbedding: (thoughtId: string) => Promise<void>;
  subscribeToTeamThoughts: (teamIds: string[]) => () => void;
}

const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
};

export const useThoughtStore = create<ThoughtState>((set, get) => ({
  thoughts: [],
  loading: false,

  fetchThoughts: async (teamIds: string[]) => {
    if (teamIds.length === 0) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select(`
          *,
          profiles!thoughts_user_id_fkey (full_name),
          teams!thoughts_team_id_fkey (name)
        `)
        .in('team_id', teamIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const thoughtsWithMetadata = await Promise.all(
        data.map(async (thought) => {
          const { count } = await supabase
            .from('thoughts')
            .select('*', { count: 'exact', head: true })
            .eq('parent_question_id', thought.id);
          
          return {
            ...thought,
            author_name: (thought.profiles as any)?.full_name || 'Unknown',
            team_name: (thought.teams as any)?.name || 'Unknown',
            answer_count: count || 0,
            time_ago: getTimeAgo(new Date(thought.created_at)),
          };
        })
      );
      set({ thoughts: thoughtsWithMetadata as Thought[], loading: false });
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      set({ loading: false });
    }
  },

  createThought: async (thoughtData, user, teamId) => {
    const { type, title, description, imageUrl, parentQuestionId } = thoughtData;

    if (!user || !teamId) {
      throw new Error('User or team not provided');
    }

    const { data: newThought, error } = await supabase
      .from('thoughts')
      .insert({
        user_id: user.id,
        team_id: teamId,
        type,
        title,
        description,
        image_url: imageUrl,
        parent_question_id: parentQuestionId || null,
        status: type === 'question' ? 'open' : 'closed',
      })
      .select()
      .single();

    if (error) throw error;
    if (!newThought) throw new Error("Thought creation failed.");

    // Manually prepend the new thought for instant UI update
    const newThoughtWithMeta: Thought = {
      ...(newThought as any),
      author_name: user.full_name || 'You',
      team_name: '', // Team name is not immediately available, subscription will update it
      answer_count: 0,
      time_ago: 'Just now',
    };
    set(state => ({ thoughts: [newThoughtWithMeta, ...state.thoughts] }));


    // Trigger the embedding function
    supabase.functions.invoke('generate-thought-embedding', {
      body: { thought_id: newThought.id },
    });

    return newThought;
  },

  retryEmbedding: async (thoughtId: string) => {
    set((state) => ({
      thoughts: state.thoughts.map((t) =>
        t.id === thoughtId ? { ...t, embedding_status: 'processing' } : t
      ),
    }));
    try {
      await supabase.functions.invoke('generate-thought-embedding', {
        body: { thought_id: thoughtId },
      });
    } catch (error) {
      console.error('Error retrying embedding:', error);
    }
  },

  subscribeToTeamThoughts: (teamIds: string[]) => {
    const channel = supabase
      .channel(`team-thoughts-${teamIds.join('-')}`)
      .on<Thought>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'thoughts',
          filter: `team_id=in.(${teamIds.join(',')})`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          set((state) => {
            let newThoughts = [...state.thoughts];
            if (eventType === 'INSERT') {
              newThoughts = [newRecord as Thought, ...newThoughts];
            } else if (eventType === 'UPDATE') {
              newThoughts = newThoughts.map((t) =>
                t.id === newRecord.id ? (newRecord as Thought) : t
              );
            } else if (eventType === 'DELETE') {
              const oldId = (oldRecord as Thought).id;
              newThoughts = newThoughts.filter((t) => t.id !== oldId);
            }
            return { thoughts: newThoughts };
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },
})); 
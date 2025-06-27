import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';
import { Database } from '@/types/database';

type Thought = Database['public']['Tables']['thoughts']['Row'] & {
  author_name: string;
  team_name: string;
  answer_count: number;
  time_ago: string;
  ai_description: string | null;
  embedding_status: string | null;
};

export function useThoughts() {
  const { user } = useAuth();
  const { selectedTeams } = useTeam();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(false);

  const handleThoughtUpdate = (payload: any) => {
    setThoughts((currentThoughts) =>
      currentThoughts.map((thought) =>
        thought.id === payload.new.id ? { ...thought, ...payload.new } : thought
      )
    );
  };

  useEffect(() => {
    if (user && selectedTeams.length > 0) {
      fetchThoughts();
    }

    const channel = supabase
      .channel('thoughts-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'thoughts' },
        handleThoughtUpdate
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedTeams]);

  const fetchThoughts = useCallback(async () => {
    if (!user || selectedTeams.length === 0) return;

    try {
      setLoading(true);
      
      const teamIds = selectedTeams.map(team => team.id);
      
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
          let answerCount = 0;
          if (thought.type === 'question') {
            const { count } = await supabase
              .from('thoughts')
              .select('*', { count: 'exact', head: true })
              .eq('parent_question_id', thought.id);
            answerCount = count || 0;
          }

          const timeAgo = getTimeAgo(new Date(thought.created_at));

          return {
            ...thought,
            author_name: (thought.profiles as any)?.full_name || 'Unknown',
            team_name: (thought.teams as any)?.name || 'Unknown',
            answer_count: answerCount,
            time_ago: timeAgo,
          };
        })
      );

      // Cast to Thought[] to satisfy TypeScript
      setThoughts(thoughtsWithMetadata as Thought[]);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedTeams]);

  const createThought = async (
    type: 'question' | 'answer' | 'document',
    title: string,
    description: string,
    imageUrl: string,
    parentQuestionId?: string
  ) => {
    if (!user || selectedTeams.length === 0) throw new Error('User or teams not available');

    const targetTeam = selectedTeams[0];

    try {
      const { data: newThought, error } = await supabase
        .from('thoughts')
        .insert({
          user_id: user.id,
          team_id: targetTeam.id,
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

      // Manually add the new thought to the local state to avoid a full refresh
      // This provides a faster UI update. The realtime subscription will handle subsequent updates.
      await fetchThoughts(); 

      // Asynchronously trigger the embedding generation
      // This is a "fire-and-forget" operation from the client's perspective
      supabase.functions.invoke('generate-thought-embedding', {
        body: { thought_id: newThought.id },
      });

      return newThought;
    } catch (error) {
      throw error;
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  return {
    thoughts,
    loading,
    createThought,
    refreshThoughts: fetchThoughts,
  };
}
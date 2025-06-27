import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';
import { Database } from '@/types/database';

type Thought = Database['public']['Tables']['thoughts']['Row'] & {
  author_name: string;
  team_name: string;
  answer_count: number;
  time_ago: string;
};

export function useThoughts() {
  const { user } = useAuth();
  const { selectedTeams } = useTeam();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && selectedTeams.length > 0) {
      fetchThoughts();
    }
  }, [user, selectedTeams]);

  const fetchThoughts = async () => {
    if (!user || selectedTeams.length === 0) return;

    try {
      setLoading(true);
      
      // Get team IDs from selected teams
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
          // Count answers for questions
          let answerCount = 0;
          if (thought.type === 'question') {
            const { count } = await supabase
              .from('thoughts')
              .select('*', { count: 'exact', head: true })
              .eq('parent_question_id', thought.id);
            answerCount = count || 0;
          }

          // Calculate time ago
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

      setThoughts(thoughtsWithMetadata);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createThought = async (
    type: 'question' | 'answer' | 'document',
    title: string,
    description: string,
    imageUrl: string,
    parentQuestionId?: string
  ) => {
    if (!user || selectedTeams.length === 0) throw new Error('User or teams not available');

    // Use the first selected team for creating new thoughts
    const targetTeam = selectedTeams[0];

    try {
      const { data, error } = await supabase
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

      await fetchThoughts();
      return data;
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
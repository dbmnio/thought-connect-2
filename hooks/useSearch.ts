import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTeam } from './useTeam'; // Your existing hook for team context
import { Thought } from '../components/thoughts/ThoughtCard';

export function useSearch() {
  const { selectedTeams } = useTeam();
  const [searchResults, setSearchResults] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const teamIds = selectedTeams.map((team) => team.id);

    try {
      const { data, error } = await supabase.functions.invoke('search-thoughts', {
        body: { query, teamIds },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error)
      }

      setSearchResults(data.thoughts);
    } catch (e: any) {
      setError(e.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { searchResults, isLoading, error, performSearch };
} 
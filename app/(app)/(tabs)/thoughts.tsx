import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { SearchBar } from '@/components/thoughts/SearchBar';
import { FilterChips, FilterType } from '@/components/thoughts/FilterChips';
import { ThoughtList } from '@/components/thoughts/ThoughtList';

export default function Thoughts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { thoughts } = useThoughtStore();
  const { user } = useAuth();
  const { selectedTeams } = useTeam();
  const { fetchThoughts, subscribeToTeamThoughts } = useThoughtStore();

  useEffect(() => {
    const teamIds = selectedTeams.map(t => t.id);
    if (teamIds.length > 0) {
      fetchThoughts(teamIds);
      const unsubscribe = subscribeToTeamThoughts(teamIds);
      return () => unsubscribe();
    }
  }, [selectedTeams, fetchThoughts, subscribeToTeamThoughts]);

  const filteredThoughts = thoughts.filter(thought => {
    const matchesSearch = thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (thought.description && thought.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'my-thoughts':
        return thought.user_id === user?.id;
      case 'suggested':
        return thought.type === 'question' && thought.user_id !== user?.id;
      case 'open':
        return thought.type === 'question' && thought.status === 'open';
      default:
        return true;
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FilterChips activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </View>

      <ThoughtList thoughts={filteredThoughts} searchQuery={searchQuery} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});
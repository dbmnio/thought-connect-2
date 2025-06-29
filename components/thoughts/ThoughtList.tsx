import { ScrollView, StyleSheet } from 'react-native';
import { ThoughtCard, Thought } from './ThoughtCard';
import { EmptyState } from './EmptyState';

type ThoughtListProps = {
  thoughts: Thought[];
  searchQuery: string;
};

export function ThoughtList({ thoughts, searchQuery }: ThoughtListProps) {
  return (
    <ScrollView style={styles.thoughtsList} showsVerticalScrollIndicator={false}>
      {thoughts.length > 0 ? (
        thoughts.map((thought) => (
          <ThoughtCard key={thought.id} thought={thought} />
        ))
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  thoughtsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
}); 
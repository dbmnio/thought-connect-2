import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from 'expo-router';
// Import other components like Avatar, Badge as needed from your project
// import Avatar from '../ui/Avatar';

// Define a type for a Thought, which should match the return type of your search function
export type Thought = {
  id: string;
  title: string;
  description: string;
  author_full_name: string;
  team_name: string;
  answer_count: number;
  similarity?: number;
  // ... other fields
};

type ThoughtCardProps = {
  thought: Thought;
};

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Navigate to the thought details screen, as per your navigation diagram
    navigation.navigate('question-thread/[id]', { id: thought.id });
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      {/* Replicate the thought display style from your thoughts.tsx page here */}
      <Text style={styles.title}>{thought.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{thought.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{thought.author_full_name} in {thought.team_name}</Text>
        {thought.answer_count > 0 && (
          <Text style={styles.meta}>{thought.answer_count} Answers</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Add styles consistent with your app's theme
  card: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  meta: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 
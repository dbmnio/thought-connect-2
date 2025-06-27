import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';

// A simple 1x1 transparent PNG for testing
const SAMPLE_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Extract the Thought type from the hook's return value if possible, or redefine here
// This is a simplified version for the test component
type ThoughtForTest = {
  id: string;
  title: string | null;
  embedding_status: string | null;
  ai_description: string | null;
};

export default function EmbeddingTestScreen() {
  const { user } = useAuth();
  const { selectedTeams } = useTeam();
  const { 
    thoughts, 
    loading, 
    fetchThoughts, 
    createThought, 
    retryEmbedding, 
    subscribeToTeamThoughts 
  } = useThoughtStore();

  useEffect(() => {
    const teamIds = selectedTeams.map(t => t.id);
    if (teamIds.length > 0) {
      fetchThoughts(teamIds);
      const unsubscribe = subscribeToTeamThoughts(teamIds);
      return () => unsubscribe();
    }
  }, [selectedTeams, fetchThoughts, subscribeToTeamThoughts]);

  const handleCreateTestThought = async () => {
    if (!user || selectedTeams.length === 0) {
      alert('You must be in a team to create a thought.');
      return;
    }
    const teamId = selectedTeams[0].id;

    try {
      await createThought(
        {
          type: 'document',
          title: `Test Thought @ ${new Date().toLocaleTimeString()}`,
          description: 'This is a test thought created from the test screen.',
          imageUrl: SAMPLE_IMAGE_BASE64,
        },
        user,
        teamId
      );
    } catch (error) {
      console.error('Failed to create test thought:', error);
      alert('Failed to create test thought. See console for details.');
    }
  };

  const renderThoughtItem = ({ item }: { item: ThoughtForTest }) => (
    <View style={styles.thoughtItem}>
      <Text style={styles.thoughtTitle}>{item.title}</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status: </Text>
        {item.embedding_status === 'pending' || item.embedding_status === 'processing' ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" />
            <Text style={styles.statusText}>{item.embedding_status}...</Text>
          </View>
        ) : item.embedding_status === 'failed' ? (
          <View style={styles.statusFailedContainer}>
            <Text style={styles.statusFailed}>❌ Failed</Text>
            <Button title="Retry" onPress={() => retryEmbedding(item.id)} />
          </View>
        ) : (
          <Text style={styles.statusCompleted}>✅ Completed</Text>
        )}
      </View>
      {item.embedding_status === 'completed' && (
        <Text style={styles.description}>
          <Text style={styles.descriptionLabel}>AI Description:</Text> {item.ai_description}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Embedding Generation Test</Text>
        <View style={styles.buttonContainer}>
          <Button title="Create Test Thought" onPress={handleCreateTestThought} />
          <Button title="Refresh" onPress={() => fetchThoughts(selectedTeams.map(t => t.id))} />
        </View>
      </View>
      {loading && thoughts.length === 0 ? (
        <ActivityIndicator size="large" style={styles.fullScreenSpinner} />
      ) : (
        <FlashList
          data={thoughts}
          renderItem={renderThoughtItem}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={100}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fullScreenSpinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thoughtItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  thoughtTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontWeight: '500',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontStyle: 'italic',
    color: '#6B7280',
  },
  statusFailedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  statusFailed: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  statusCompleted: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  description: {
    color: '#374151',
  },
  descriptionLabel: {
    fontWeight: '500',
  },
}); 
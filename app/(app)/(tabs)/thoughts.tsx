import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, CircleHelp as HelpCircle, MessageSquare, FileText, Clock, User } from 'lucide-react-native';
import { useThoughts } from '@/hooks/useThoughts';
import { useAuth } from '@/hooks/useAuth';

type FilterType = 'all' | 'my-thoughts' | 'suggested' | 'open';

export default function Thoughts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { thoughts, loading } = useThoughts();
  const { user } = useAuth();
  const router = useRouter();

  const filters = [
    { key: 'all' as FilterType, label: 'All', icon: MessageSquare },
    { key: 'my-thoughts' as FilterType, label: 'My Thoughts', icon: User },
    { key: 'suggested' as FilterType, label: 'Suggested', icon: HelpCircle },
    { key: 'open' as FilterType, label: 'Open', icon: Clock },
  ];

  const getThoughtIcon = (type: string) => {
    switch (type) {
      case 'question':
        return HelpCircle;
      case 'answer':
        return MessageSquare;
      case 'document':
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const getThoughtColor = (type: string) => {
    switch (type) {
      case 'question':
        return '#EF4444';
      case 'answer':
        return '#10B981';
      case 'document':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const filteredThoughts = thoughts.filter(thought => {
    const matchesSearch = thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thought.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeFilter) {
      case 'my-thoughts':
        return matchesSearch && thought.user_id === user?.id;
      case 'suggested':
        return matchesSearch && thought.type === 'question' && thought.user_id !== user?.id;
      case 'open':
        return matchesSearch && thought.type === 'question' && thought.status === 'open';
      default:
        return matchesSearch;
    }
  });

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search thoughts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            const isActive = activeFilter === filter.key;
            
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, isActive && styles.filterButtonActive]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <IconComponent
                  color={isActive ? '#FFFFFF' : '#6B7280'}
                  size={16}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    isActive && styles.filterButtonTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Thoughts List */}
      <ScrollView style={styles.thoughtsList} showsVerticalScrollIndicator={false}>
        {filteredThoughts.map((thought) => {
          const IconComponent = getThoughtIcon(thought.type);
          const iconColor = getThoughtColor(thought.type);
          
          return (
            <TouchableOpacity
              key={thought.id}
              style={styles.thoughtCard}
              onPress={() => router.push(`/(app)/question-thread/${thought.id}`)}
            >
              <View style={styles.thoughtHeader}>
                <View style={styles.thoughtInfo}>
                  <View style={[styles.thoughtTypeIndicator, { backgroundColor: iconColor }]}>
                    <IconComponent color="#FFFFFF" size={16} />
                  </View>
                  <View style={styles.thoughtMetadata}>
                    <Text style={styles.thoughtAuthor}>{thought.author_name}</Text>
                    <Text style={styles.thoughtTime}>{thought.time_ago}</Text>
                  </View>
                </View>
                {thought.type === 'question' && thought.answer_count > 0 && (
                  <View style={styles.answersBadge}>
                    <Text style={styles.answersBadgeText}>{thought.answer_count}</Text>
                  </View>
                )}
              </View>

              <View style={styles.thoughtContent}>
                <Image source={{ uri: thought.image_url }} style={styles.thoughtImage} />
                <View style={styles.thoughtTextContainer}>
                  <Text style={styles.thoughtSummary} numberOfLines={2}>
                    {thought.title}
                  </Text>
                  <Text style={styles.thoughtDescription} numberOfLines={1}>
                    {thought.description}
                  </Text>
                  <Text style={styles.thoughtTeam}>#{thought.team_name}</Text>
                </View>
              </View>

              {thought.status === 'open' && thought.type === 'question' && (
                <View style={styles.openIndicator}>
                  <Clock color="#F59E0B" size={14} />
                  <Text style={styles.openText}>Open for answers</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredThoughts.length === 0 && (
          <View style={styles.emptyState}>
            <MessageSquare color="#9CA3AF" size={64} />
            <Text style={styles.emptyTitle}>No thoughts found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start capturing your first thought with the camera!'}
            </Text>
          </View>
        )}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  thoughtsList: {
    flex: 1,
    padding: 16,
  },
  thoughtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thoughtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  thoughtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thoughtTypeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thoughtMetadata: {
    gap: 2,
  },
  thoughtAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  thoughtTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  answersBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  answersBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  thoughtContent: {
    flexDirection: 'row',
    gap: 12,
  },
  thoughtImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  thoughtTextContainer: {
    flex: 1,
    gap: 4,
  },
  thoughtSummary: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
  },
  thoughtDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  thoughtTeam: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
  openIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  openText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});
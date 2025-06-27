import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, FileText, CircleHelp as HelpCircle } from 'lucide-react-native';
import { SearchResult } from '../../types/SearchResult';

type SearchResultCardProps = {
  item: SearchResult;
};

function getTypeIcon(type: string) {
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
}

function getTypeColor(type: string) {
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
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  const router = useRouter();
  const IconComponent = getTypeIcon(item.type);
  const typeColor = getTypeColor(item.type);

  return (
    <TouchableOpacity
      style={styles.searchResultCard}
      onPress={() => {
        if (item.type === 'question') {
          router.push(`/(app)/question-thread/${item.id}`);
        } else {
          router.push(`/(app)/answer-view/${item.id}`);
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.searchResultHeader}>
        <View style={[styles.typeIndicator, { backgroundColor: typeColor }]}>
          <IconComponent color="#FFFFFF" size={14} />
        </View>
        <View style={styles.searchResultMeta}>
          <Text style={styles.searchResultAuthor}>{item.author_name}</Text>
          <Text style={styles.searchResultTime}>{item.time_ago}</Text>
        </View>
        {item.relevance_score && (
          <View style={styles.relevanceScore}>
            <Text style={styles.relevanceText}>{Math.round(item.relevance_score)}%</Text>
          </View>
        )}
      </View>

      <Text style={styles.searchResultTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.searchResultDescription} numberOfLines={3}>
        {item.description}
      </Text>
      <Text style={styles.searchResultTeam}>#{item.team_name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchResultCard: {
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
  searchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  typeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultMeta: {
    flex: 1,
  },
  searchResultAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  searchResultTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  relevanceScore: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  relevanceText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 6,
  },
  searchResultDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  searchResultTeam: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
}); 
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CircleHelp as HelpCircle,
  MessageSquare,
  FileText,
  Clock,
} from 'lucide-react-native';
import { Database } from '@/types/database';

export type Thought = Database['public']['Tables']['thoughts']['Row'] & {
  author_name: string;
  team_name: string;
  answer_count: number;
  time_ago: string;
  ai_description: string | null;
  embedding_status: string | null;
  similarity?: number;
};

type ThoughtCardProps = {
  thought: Thought;
};

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

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const router = useRouter();
  const IconComponent = getThoughtIcon(thought.type);
  const iconColor = getThoughtColor(thought.type);

  return (
    <TouchableOpacity
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
        {thought.similarity !== undefined && (
          <View style={styles.similarityBadge}>
            <Text style={styles.similarityText}>
              {Math.round(thought.similarity * 100)}%
            </Text>
          </View>
        )}
        {thought.type === 'question' && thought.answer_count > 0 && (
          <View style={styles.answersBadge}>
            <Text style={styles.answersBadgeText}>{thought.answer_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.thoughtContent}>
        {thought.image_url && <Image source={{ uri: thought.image_url }} style={styles.thoughtImage} /> }
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
}

const styles = StyleSheet.create({
  thoughtCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thoughtMetadata: {
    justifyContent: 'center',
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
    marginTop: 2,
  },
  similarityBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  similarityText: {
    color: '#065F46',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  answersBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  answersBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  thoughtContent: {
    flexDirection: 'row',
    gap: 16,
  },
  thoughtImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  thoughtTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  thoughtSummary: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  thoughtDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  thoughtTeam: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
  openIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  openText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#B45309',
  },
}); 
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MessageCircle, Heart, Share2, MoveHorizontal as MoreHorizontal, Send, Camera, Paperclip, CircleCheck as CheckCircle, Clock, User, FileText, MessageSquare, CircleHelp as HelpCircle, Plus, Bookmark, Flag, Eye } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useThoughts } from '@/hooks/useThoughts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const { width, height } = Dimensions.get('window');

interface QuestionData {
  id: string;
  title: string;
  description: string;
  image_url: string;
  author_name: string;
  author_avatar?: string;
  team_name: string;
  created_at: string;
  upvotes: number;
  status: 'open' | 'closed';
  view_count: number;
  answer_count: number;
}

interface Answer {
  id: string;
  type: 'answer' | 'document';
  title: string;
  description: string;
  image_url: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  upvotes: number;
  is_accepted: boolean;
  confirmation_status: 'confirmed' | 'pending' | 'rejected';
}

export default function QuestionThread() {
  const router = useRouter();
  const { id: questionId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (questionId) {
      loadQuestionData();
    }
  }, [questionId]);

  const loadQuestionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      const mockQuestion: QuestionData = {
        id: questionId || '1',
        title: 'How do I implement proper state management in React Native?',
        description: 'I\'m building a complex app with multiple screens and need to share state between components. What are the best practices for state management in React Native? Should I use Context API, Redux, or Zustand?',
        image_url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
        author_name: 'Sarah Chen',
        author_avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
        team_name: 'React Native Developers',
        created_at: '2024-01-15T10:30:00Z',
        upvotes: 24,
        status: 'open',
        view_count: 156,
        answer_count: 3,
      };

      const mockAnswers: Answer[] = [
        {
          id: '1',
          type: 'answer',
          title: 'Zustand is perfect for this use case',
          description: 'I recommend using Zustand for React Native state management. It\'s lightweight, has great TypeScript support, and doesn\'t require providers. Here\'s a simple example of how to set it up...',
          image_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
          author_name: 'Alex Rodriguez',
          author_avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          created_at: '2024-01-15T11:15:00Z',
          upvotes: 18,
          is_accepted: true,
          confirmation_status: 'confirmed',
        },
        {
          id: '2',
          type: 'document',
          title: 'State Management Comparison Chart',
          description: 'I created this comprehensive comparison of different state management solutions for React Native, including performance benchmarks and use case recommendations.',
          image_url: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
          author_name: 'Maria Garcia',
          author_avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
          created_at: '2024-01-15T14:22:00Z',
          upvotes: 12,
          is_accepted: false,
          confirmation_status: 'pending',
        },
        {
          id: '3',
          type: 'answer',
          title: 'Context API with useReducer works well too',
          description: 'For medium-sized apps, the built-in Context API combined with useReducer can be sufficient. It eliminates external dependencies and works great with React DevTools.',
          image_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
          author_name: 'David Kim',
          author_avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200',
          created_at: '2024-01-15T16:45:00Z',
          upvotes: 8,
          is_accepted: false,
          confirmation_status: 'confirmed',
        },
      ];

      setQuestion(mockQuestion);
      setAnswers(mockAnswers);
    } catch (error: any) {
      setError(error.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadQuestionData();
    setRefreshing(false);
  };

  const handleUpvote = async (answerId?: string) => {
    // Implement upvote logic
    console.log('Upvote:', answerId || 'question');
  };

  const handleAcceptAnswer = async (answerId: string) => {
    // Implement accept answer logic
    console.log('Accept answer:', answerId);
  };

  const handleReply = () => {
    setShowReplyInput(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    // Implement send reply logic
    console.log('Send reply:', replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return MessageSquare;
      case 'document':
        return FileText;
      default:
        return MessageSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'answer':
        return '#10B981';
      case 'document':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (loading && !question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  if (!question) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Question not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Question</Text>
          <Text style={styles.headerSubtitle}>{question.team_name}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark 
              color={isBookmarked ? "#F59E0B" : "#6B7280"} 
              size={20}
              fill={isBookmarked ? "#F59E0B" : "none"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <MoreHorizontal color="#6B7280" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          {/* Question Image */}
          <View style={styles.questionImageContainer}>
            <Image source={{ uri: question.image_url }} style={styles.questionImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.questionImageOverlay}
            />
            <View style={styles.questionBadge}>
              <HelpCircle color="#FFFFFF" size={16} />
              <Text style={styles.questionBadgeText}>Question</Text>
            </View>
          </View>

          {/* Question Content */}
          <View style={styles.questionContent}>
            <View style={styles.questionHeader}>
              <Avatar
                uri={question.author_avatar}
                name={question.author_name}
                size="medium"
              />
              <View style={styles.questionAuthorInfo}>
                <Text style={styles.questionAuthor}>{question.author_name}</Text>
                <Text style={styles.questionTime}>{formatTimeAgo(question.created_at)}</Text>
              </View>
              <Badge 
                variant={question.status === 'open' ? 'success' : 'secondary'} 
                size="small"
              >
                {question.status === 'open' ? (
                  <>
                    <Clock color="#16A34A" size={12} />
                    <Text style={{ marginLeft: 4 }}>Open</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle color="#64748B" size={12} />
                    <Text style={{ marginLeft: 4 }}>Closed</Text>
                  </>
                )}
              </Badge>
            </View>

            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionDescription}>{question.description}</Text>

            {/* Question Stats */}
            <View style={styles.questionStats}>
              <View style={styles.statItem}>
                <Heart color="#EF4444" size={16} />
                <Text style={styles.statText}>{question.upvotes}</Text>
              </View>
              <View style={styles.statItem}>
                <MessageCircle color="#6366F1" size={16} />
                <Text style={styles.statText}>{question.answer_count}</Text>
              </View>
              <View style={styles.statItem}>
                <Eye color="#9CA3AF" size={16} />
                <Text style={styles.statText}>{question.view_count}</Text>
              </View>
            </View>

            {/* Question Actions */}
            <View style={styles.questionActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpvote()}
              >
                <Heart color="#EF4444" size={18} />
                <Text style={styles.actionButtonText}>Upvote</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReply}
              >
                <MessageCircle color="#6366F1" size={18} />
                <Text style={styles.actionButtonText}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Share2 color="#9CA3AF" size={18} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Answers Section */}
        <View style={styles.answersSection}>
          <View style={styles.answersSectionHeader}>
            <Text style={styles.answersSectionTitle}>
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>Most helpful</Text>
            </TouchableOpacity>
          </View>

          {answers.map((answer, index) => {
            const TypeIcon = getTypeIcon(answer.type);
            const typeColor = getTypeColor(answer.type);

            return (
              <View key={answer.id} style={styles.answerCard}>
                {/* Answer Header */}
                <View style={styles.answerHeader}>
                  <Avatar
                    uri={answer.author_avatar}
                    name={answer.author_name}
                    size="medium"
                  />
                  <View style={styles.answerAuthorInfo}>
                    <Text style={styles.answerAuthor}>{answer.author_name}</Text>
                    <Text style={styles.answerTime}>{formatTimeAgo(answer.created_at)}</Text>
                  </View>
                  <View style={styles.answerBadges}>
                    <Badge variant="secondary" size="small">
                      <TypeIcon color={typeColor} size={12} />
                      <Text style={{ marginLeft: 4, color: typeColor }}>
                        {answer.type === 'answer' ? 'Answer' : 'Document'}
                      </Text>
                    </Badge>
                    {answer.is_accepted && (
                      <Badge variant="success" size="small">
                        <CheckCircle color="#16A34A" size={12} />
                        <Text style={{ marginLeft: 4 }}>Accepted</Text>
                      </Badge>
                    )}
                  </View>
                </View>

                {/* Answer Content */}
                <TouchableOpacity
                  style={styles.answerContent}
                  onPress={() => router.push(`/(app)/answer-view/${answer.id}`)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: answer.image_url }} style={styles.answerImage} />
                  <View style={styles.answerTextContent}>
                    <Text style={styles.answerTitle}>{answer.title}</Text>
                    <Text style={styles.answerDescription} numberOfLines={3}>
                      {answer.description}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Answer Actions */}
                <View style={styles.answerActions}>
                  <TouchableOpacity
                    style={styles.answerActionButton}
                    onPress={() => handleUpvote(answer.id)}
                  >
                    <Heart color="#EF4444" size={16} />
                    <Text style={styles.answerActionText}>{answer.upvotes}</Text>
                  </TouchableOpacity>
                  
                  {!answer.is_accepted && question.status === 'open' && (
                    <TouchableOpacity
                      style={styles.answerActionButton}
                      onPress={() => handleAcceptAnswer(answer.id)}
                    >
                      <CheckCircle color="#10B981" size={16} />
                      <Text style={styles.answerActionText}>Accept</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity style={styles.answerActionButton}>
                    <Flag color="#9CA3AF" size={16} />
                    <Text style={styles.answerActionText}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add some bottom padding for the FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reply Input */}
      {showReplyInput && (
        <View style={[styles.replyContainer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write your reply..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <View style={styles.replyActions}>
              <TouchableOpacity style={styles.replyAttachButton}>
                <Paperclip color="#6B7280" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.replyAttachButton}>
                <Camera color="#6B7280" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.replySendButton, !replyText.trim() && styles.replySendButtonDisabled]}
                onPress={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Floating Action Button */}
      {!showReplyInput && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={handleReply}
        >
          <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.fabGradient}>
            <Plus color="#FFFFFF" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionImageContainer: {
    position: 'relative',
    height: 240,
  },
  questionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  questionImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  questionBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  questionBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  questionContent: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  questionAuthorInfo: {
    flex: 1,
  },
  questionAuthor: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  questionTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  questionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    lineHeight: 28,
    marginBottom: 12,
  },
  questionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  questionStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  questionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  answersSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  answersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  answersSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  answerCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  answerAuthorInfo: {
    flex: 1,
  },
  answerAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  answerTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  answerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  answerContent: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  answerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  answerTextContent: {
    flex: 1,
  },
  answerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  answerDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  answerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  answerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  answerActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  replyContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    maxHeight: 100,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyAttachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replySendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replySendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
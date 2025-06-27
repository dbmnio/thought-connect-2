import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Modal,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MoveHorizontal as MoreHorizontal, 
  CircleCheck as CheckCircle, 
  Flag, 
  Bookmark, 
  Eye,
  MessageSquare,
  FileText,
  User,
  Clock,
  ThumbsUp,
  Download,
  ExternalLink,
  Lightbulb,
  Star,
  X
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ActionSheet } from '@/components/ui/ActionSheet';

const { width, height } = Dimensions.get('window');

interface AnswerData {
  id: string;
  type: 'answer' | 'document';
  title: string;
  description: string;
  image_url: string;
  author_name: string;
  author_avatar?: string;
  author_bio?: string;
  created_at: string;
  upvotes: number;
  view_count: number;
  is_accepted: boolean;
  confirmation_status: 'confirmed' | 'pending' | 'rejected';
  question_title: string;
  question_id: string;
  tags: string[];
  related_answers: Array<{
    id: string;
    title: string;
    author_name: string;
    upvotes: number;
  }>;
}

export default function AnswerView() {
  const router = useRouter();
  const { id: answerId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (answerId) {
      loadAnswerData();
    }
  }, [answerId]);

  const loadAnswerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      const mockAnswer: AnswerData = {
        id: answerId || '1',
        type: 'answer',
        title: 'Zustand is perfect for this use case',
        description: 'I recommend using Zustand for React Native state management. It\'s lightweight, has great TypeScript support, and doesn\'t require providers like Redux does.\n\nHere\'s why Zustand is excellent for React Native:\n\n1. **Minimal boilerplate** - You can create a store in just a few lines\n2. **TypeScript first** - Built with TypeScript in mind\n3. **No providers needed** - Unlike Context API or Redux\n4. **Great performance** - Only re-renders components that use changed state\n5. **DevTools support** - Works with Redux DevTools\n\nHere\'s a simple example of how to set it up:\n\n```javascript\nimport { create } from \'zustand\'\n\nconst useStore = create((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n  decrement: () => set((state) => ({ count: state.count - 1 })),\n}))\n```\n\nThis approach scales really well as your app grows, and the learning curve is much gentler than Redux.',
        image_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        author_name: 'Alex Rodriguez',
        author_avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        author_bio: 'Senior React Native Developer at TechCorp. 8+ years building mobile apps. Passionate about clean code and developer experience.',
        created_at: '2024-01-15T11:15:00Z',
        upvotes: 24,
        view_count: 156,
        is_accepted: true,
        confirmation_status: 'confirmed',
        question_title: 'How do I implement proper state management in React Native?',
        question_id: 'q1',
        tags: ['React Native', 'State Management', 'Zustand', 'TypeScript'],
        related_answers: [
          {
            id: '2',
            title: 'Context API with useReducer works well too',
            author_name: 'David Kim',
            upvotes: 12,
          },
          {
            id: '3',
            title: 'Redux Toolkit is still a solid choice',
            author_name: 'Sarah Chen',
            upvotes: 18,
          },
        ],
      };

      setAnswer(mockAnswer);
    } catch (error: any) {
      setError(error.message || 'Failed to load answer');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    setIsUpvoted(!isUpvoted);
    // Implement upvote logic
  };

  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);
    // Implement bookmark logic
  };

  const handleAccept = async () => {
    // Implement accept answer logic
    console.log('Accept answer');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${answer?.type}: ${answer?.title}`,
        url: `https://app.example.com/answer/${answerId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
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

  const getActionSheetOptions = () => [
    {
      label: 'Share',
      onPress: handleShare,
    },
    {
      label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
      onPress: handleBookmark,
    },
    {
      label: 'View Question',
      onPress: () => router.push(`/(app)/question-thread/${answer?.question_id}`),
    },
    {
      label: 'Report Content',
      onPress: () => console.log('Report'),
      destructive: true,
    },
  ];

  if (loading && !answer) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!answer) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Text style={styles.errorText}>Content not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const TypeIcon = answer.type === 'answer' ? MessageSquare : FileText;
  const typeColor = answer.type === 'answer' ? '#10B981' : '#F59E0B';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => setShowImageModal(true)}
          activeOpacity={0.9}
        >
          <Image source={{ uri: answer.image_url }} style={styles.heroImage} />
        </TouchableOpacity>
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.heroOverlay}
        />
        
        {/* Header Controls */}
        <View style={[styles.headerControls, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowActionSheet(true)}
            >
              <MoreHorizontal color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.heroMeta}>
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
          
          <Text style={styles.heroTitle}>{answer.title}</Text>
          
          <TouchableOpacity
            style={styles.questionLink}
            onPress={() => router.push(`/(app)/question-thread/${answer.question_id}`)}
          >
            <Text style={styles.questionLinkText}>
              Answering: {answer.question_title}
            </Text>
            <ExternalLink color="#FFFFFF" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Author Section */}
        <View style={styles.authorSection}>
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={() => setShowAuthorModal(true)}
          >
            <Avatar
              uri={answer.author_avatar}
              name={answer.author_name}
              size="large"
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{answer.author_name}</Text>
              <Text style={styles.authorTime}>{formatTimeAgo(answer.created_at)}</Text>
              {answer.author_bio && (
                <Text style={styles.authorBio} numberOfLines={2}>
                  {answer.author_bio}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.authorStats}>
            <View style={styles.statItem}>
              <Eye color="#9CA3AF" size={16} />
              <Text style={styles.statText}>{answer.view_count}</Text>
            </View>
            <View style={styles.statItem}>
              <Heart color="#EF4444" size={16} />
              <Text style={styles.statText}>{answer.upvotes}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{answer.description}</Text>
          
          {/* Tags */}
          {answer.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tags}>
                {answer.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, isUpvoted && styles.actionButtonActive]}
            onPress={handleUpvote}
          >
            <Heart 
              color={isUpvoted ? "#FFFFFF" : "#EF4444"} 
              size={20}
              fill={isUpvoted ? "#FFFFFF" : "none"}
            />
            <Text style={[styles.actionButtonText, isUpvoted && styles.actionButtonTextActive]}>
              {isUpvoted ? 'Upvoted' : 'Upvote'} ({answer.upvotes + (isUpvoted ? 1 : 0)})
            </Text>
          </TouchableOpacity>

          {!answer.is_accepted && answer.type === 'answer' && (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.acceptButtonGradient}>
                <CheckCircle color="#FFFFFF" size={20} />
                <Text style={styles.acceptButtonText}>Accept Answer</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 color="#6366F1" size={20} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            onPress={handleBookmark}
          >
            <Bookmark 
              color={isBookmarked ? "#FFFFFF" : "#F59E0B"} 
              size={20}
              fill={isBookmarked ? "#FFFFFF" : "none"}
            />
            <Text style={[styles.actionButtonText, isBookmarked && styles.actionButtonTextActive]}>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Related Answers */}
        {answer.related_answers.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Lightbulb color="#F59E0B" size={20} />
              <Text style={styles.relatedTitle}>Related Answers</Text>
            </View>
            
            {answer.related_answers.map((related) => (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedItem}
                onPress={() => router.push(`/(app)/answer-view/${related.id}`)}
              >
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedItemTitle}>{related.title}</Text>
                  <Text style={styles.relatedAuthor}>by {related.author_name}</Text>
                </View>
                <View style={styles.relatedMeta}>
                  <Heart color="#EF4444" size={14} />
                  <Text style={styles.relatedUpvotes}>{related.upvotes}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <X color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Image source={{ uri: answer.image_url }} style={styles.fullScreenImage} />
        </View>
      </Modal>

      {/* Author Modal */}
      <Modal
        visible={showAuthorModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.authorModalContainer}>
          <View style={[styles.authorModalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAuthorModal(false)}
            >
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.authorModalTitle}>Author Profile</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <ScrollView style={styles.authorModalContent}>
            <View style={styles.authorModalProfile}>
              <Avatar
                uri={answer.author_avatar}
                name={answer.author_name}
                size="xlarge"
              />
              <Text style={styles.authorModalName}>{answer.author_name}</Text>
              {answer.author_bio && (
                <Text style={styles.authorModalBio}>{answer.author_bio}</Text>
              )}
              
              <View style={styles.authorModalStats}>
                <View style={styles.authorModalStat}>
                  <Text style={styles.authorModalStatValue}>24</Text>
                  <Text style={styles.authorModalStatLabel}>Answers</Text>
                </View>
                <View style={styles.authorModalStat}>
                  <Text style={styles.authorModalStatValue}>156</Text>
                  <Text style={styles.authorModalStatLabel}>Upvotes</Text>
                </View>
                <View style={styles.authorModalStat}>
                  <Text style={styles.authorModalStatValue}>12</Text>
                  <Text style={styles.authorModalStatLabel}>Accepted</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Actions"
        options={getActionSheetOptions()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
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
  heroSection: {
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  headerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 12,
  },
  questionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#E5E7EB',
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  authorTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  authorBio: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  authorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  contentSection: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 24,
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  actionSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  acceptButton: {
    flex: 1,
    minWidth: 140,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  relatedSection: {
    margin: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  relatedTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  relatedContent: {
    flex: 1,
    marginRight: 12,
  },
  relatedItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  relatedAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  relatedUpvotes: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fullScreenImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  authorModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  authorModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalHeaderRight: {
    width: 40,
  },
  authorModalContent: {
    flex: 1,
    padding: 20,
  },
  authorModalProfile: {
    alignItems: 'center',
  },
  authorModalName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  authorModalBio: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  authorModalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  authorModalStat: {
    alignItems: 'center',
  },
  authorModalStatValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  authorModalStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginTop: 4,
  },
});
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Send, Bot, User, Search, MessageSquare, FileText, CircleHelp as HelpCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SearchResult {
  id: string;
  type: 'question' | 'answer' | 'document';
  title: string;
  description: string;
  image_url: string;
  author_name: string;
  team_name: string;
  time_ago: string;
  relevance_score?: number;
}

export default function KnowledgeBase() {
  const { profile } = useAuth();
  const { selectedTeams } = useTeam();
  const { thoughts, fetchThoughts, subscribeToTeamThoughts } = useThoughtStore();
  const router = useRouter();
  
  useEffect(() => {
    const teamIds = selectedTeams.map(t => t.id);
    if (teamIds.length > 0) {
      fetchThoughts(teamIds);
      const unsubscribe = subscribeToTeamThoughts(teamIds);
      return () => unsubscribe();
    }
  }, [selectedTeams, fetchThoughts, subscribeToTeamThoughts]);
  
  // Toggle state
  const [mode, setMode] = useState<'chat' | 'search'>('chat');
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI learning assistant. Ask me anything about your studies or knowledge base.',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Simulate AI response with RAG
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Based on your knowledge base, I found relevant information about your question. This AI response is enhanced with RAG (Retrieval-Augmented Generation) to provide contextual answers from your thoughts and documents.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    // Simulate search with relevance scoring
    setTimeout(() => {
      const filteredThoughts = thoughts
        .filter(thought => 
          thought.title.toLowerCase().includes(query.toLowerCase()) ||
          thought.description.toLowerCase().includes(query.toLowerCase())
        )
        .map(thought => ({
          ...thought,
          relevance_score: Math.random() * 100, // Mock relevance score
        }))
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
        .slice(0, 10); // Limit to top 10 results

      setSearchResults(filteredThoughts);
      setSearchLoading(false);
    }, 500);
  };

  const handleSubmit = () => {
    if (mode === 'chat') {
      handleSend();
    } else {
      handleSearch(inputText);
      setSearchQuery(inputText);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTypeIcon = (type: string) => {
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

  const getTypeColor = (type: string) => {
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
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
              <Text style={styles.relevanceText}>
                {Math.round(item.relevance_score)}%
              </Text>
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
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {mode === 'chat' ? (
          // Chat Mode
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatar}>
                    {message.isUser ? (
                      <User color="#FFFFFF" size={16} />
                    ) : (
                      <Bot color="#FFFFFF" size={16} />
                    )}
                  </View>
                  <Text style={styles.messageTime}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userText : styles.aiText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}
            
            {loading && (
              <View style={[styles.messageContainer, styles.aiMessage]}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatar}>
                    <Bot color="#FFFFFF" size={16} />
                  </View>
                  <Text style={styles.messageTime}>Now</Text>
                </View>
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                    <View style={styles.typingDot} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          // Search Mode
          <>
            {searchQuery && (
              <View style={styles.searchHeader}>
                <Text style={styles.searchResultsCount}>
                  {searchLoading ? 'Searching...' : `${searchResults.length} results found`}
                </Text>
              </View>
            )}

            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.searchResultsList}
              contentContainerStyle={styles.searchResultsContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                searchQuery ? (
                  <View style={styles.emptyState}>
                    <Search color="#9CA3AF" size={48} />
                    <Text style={styles.emptyTitle}>
                      {searchLoading ? 'Searching...' : 'No results found'}
                    </Text>
                    <Text style={styles.emptyDescription}>
                      {searchLoading 
                        ? 'Searching through your knowledge base...'
                        : 'Try adjusting your search terms or check your spelling'
                      }
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Search color="#9CA3AF" size={48} />
                    <Text style={styles.emptyTitle}>Search Your Knowledge</Text>
                    <Text style={styles.emptyDescription}>
                      Enter keywords to search through your thoughts, questions, answers, and documents
                    </Text>
                  </View>
                )
              }
            />
          </>
        )}

        {/* Input Container with Icon Toggle */}
        <View style={styles.inputContainer}>
          {/* Mode Toggle Icons */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'chat' && styles.modeButtonActive,
              ]}
              onPress={() => {
                setMode('chat');
                setInputText('');
                setSearchResults([]);
                setSearchQuery('');
              }}
              activeOpacity={0.7}
            >
              <Bot 
                color={mode === 'chat' ? '#FFFFFF' : '#9CA3AF'} 
                size={20} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'search' && styles.modeButtonActiveSearch,
              ]}
              onPress={() => {
                setMode('search');
                setInputText('');
              }}
              activeOpacity={0.7}
            >
              <Search 
                color={mode === 'search' ? '#FFFFFF' : '#9CA3AF'} 
                size={20} 
              />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={mode === 'chat' ? 'Ask me anything...' : 'Search your knowledge base...'}
            placeholderTextColor="#9CA3AF"
            multiline={mode === 'chat'}
            maxLength={500}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSubmit}
            disabled={!inputText.trim() || loading || searchLoading}
          >
            <LinearGradient
              colors={
                inputText.trim() 
                  ? mode === 'chat' 
                    ? ['#6366F1', '#3B82F6'] 
                    : ['#F59E0B', '#D97706']
                  : ['#E5E7EB', '#E5E7EB']
              }
              style={styles.sendButtonGradient}
            >
              <Send color="#FFFFFF" size={20} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#1F2937',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchResultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContent: {
    padding: 16,
  },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 2,
  },
  modeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#6366F1',
  },
  modeButtonActiveSearch: {
    backgroundColor: '#F59E0B',
  },
  textInput: {
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
  sendButton: {
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
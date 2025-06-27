import React, { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useTeam } from '../../../hooks/useTeam';
import { useThoughtStore } from '../../../lib/stores/useThoughtStore';

import { ChatView } from '../../../components/knowledge-base/ChatView';
import { SearchView } from '../../../components/knowledge-base/SearchView';
import { InputBar } from '../../../components/knowledge-base/InputBar';
import { Message } from '../../../types/Message';
import { useSearch } from '../../../hooks/useSearch';
import { Thought } from '../../../components/thoughts/ThoughtCard';
import { SearchResult } from '../../../types/SearchResult';

function formatThoughtAsSearchResult(thought: Thought): SearchResult {
  return {
    id: thought.id,
    type: 'question', // This is an assumption
    title: thought.title,
    description: thought.description,
    image_url: '', // This info is not in the thought object
    author_name: thought.author_full_name,
    team_name: thought.team_name,
    time_ago: 'Just now', // This needs to be calculated
    relevance_score: thought.similarity ? thought.similarity * 100 : undefined,
  };
}

export default function KnowledgeBase() {
  const { selectedTeams } = useTeam();
  const { fetchThoughts, subscribeToTeamThoughts } = useThoughtStore();
  const { searchResults: rawSearchResults, isLoading: searchLoading, performSearch, error: searchError } = useSearch();

  useEffect(() => {
    const teamIds = selectedTeams.map((t) => t.id);
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
      text: "Hello! I'm your AI learning assistant. Ask me anything about your studies or knowledge base.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Based on your knowledge base, I found relevant information about your question. This AI response is enhanced with RAG (Retrieval-Augmented Generation) to provide contextual answers from your thoughts and documents.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setChatLoading(false);
    }, 1500);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }
    performSearch(query);
  };

  const handleSubmit = () => {
    if (mode === 'chat') {
      handleSend();
    } else {
      setSearchQuery(inputText);
      handleSearch(inputText);
    }
  };

  const handleModeChange = (newMode: 'chat' | 'search') => {
    setMode(newMode);
    setInputText('');
    setSearchQuery('');
  };

  const searchResults = rawSearchResults.map(formatThoughtAsSearchResult);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {mode === 'chat' ? (
          <ChatView messages={messages} isLoading={chatLoading} />
        ) : (
          <SearchView
            searchQuery={searchQuery}
            searchResults={searchResults}
            isLoading={searchLoading}
            error={searchError}
          />
        )}
        <InputBar
          mode={mode}
          onModeChange={handleModeChange}
          inputText={inputText}
          onInputTextChange={setInputText}
          onSubmit={handleSubmit}
          isSubmitDisabled={!inputText.trim() || chatLoading || searchLoading}
        />
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
});
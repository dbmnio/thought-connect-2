/**
 * @file This file renders the main knowledge base screen, which includes the chat interface.
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useTeam } from '@/hooks/useTeam';
import { useThoughtStore } from '@/lib/stores/useThoughtStore';

import { ChatView } from '@/components/knowledge-base/ChatView';
import { SearchView } from '@/components/knowledge-base/SearchView';
import { InputBar } from '@/components/knowledge-base/InputBar';
import { Message } from '@/types/Message';
import { useSearch } from '@/hooks/useSearch';
import { askQuestion } from '@/lib/api/chat';

export default function KnowledgeBaseScreen() {
  const { selectedTeams } = useTeam();
  const { fetchThoughts, subscribeToTeamThoughts } = useThoughtStore();
  const { searchResults, isLoading: searchLoading, performSearch, error: searchError } = useSearch();

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

    const question = inputText.trim();
    const teamIds = selectedTeams.map((team) => team.id);

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setChatLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    askQuestion({
      question,
      teamIds,
      onStreamUpdate: (chunk) => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, text: lastMessage.text + chunk },
            ];
          }
          return prev;
        });
      },
      onStreamEnd: () => {
        setChatLoading(false);
      },
      onError: (error) => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && !lastMessage.isUser) {
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, text: `Sorry, an error occurred: ${error.message}` },
            ];
          }
          return prev;
        });
        setChatLoading(false);
      },
    });
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

  const sortedSearchResults = [...searchResults].sort(
    (a, b) => (b.similarity || 0) - (a.similarity || 0)
  );

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
            searchResults={sortedSearchResults}
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
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Message } from '../../types/Message';
import { MessageBubble } from './MessageBubble';

type ChatViewProps = {
  messages: Message[];
  isLoading: boolean;
};

export function ChatView({ messages, isLoading }: ChatViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <View style={[styles.messageContainer, styles.aiMessage]}>
          <View style={styles.messageHeader}>
            {/* Typing indicator doesn't need avatar/time */}
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
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
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
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 6,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 22, // Matches text line height
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 3,
    // Add animation here in a real implementation
  },
}); 
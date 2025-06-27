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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
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
    gap: 4,
    paddingVertical: 8, // To match text bubble height roughly
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
}); 
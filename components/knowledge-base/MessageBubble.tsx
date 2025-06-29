import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import { Message } from '../../types/Message';

type MessageBubbleProps = {
  message: Message;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.isUser;
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={styles.messageHeader}>
        <View style={[styles.messageAvatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
          {isUser ? (
            <User color="#FFFFFF" size={16} />
          ) : (
            <Bot color="#4B5563" size={16} />
          )}
        </View>
        <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
      </View>
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#6366F1',
  },
  aiAvatar: {
    backgroundColor: '#E5E7EB',
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
}); 
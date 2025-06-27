import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
import { ModeToggle } from './ModeToggle';

type InputBarProps = {
  mode: 'chat' | 'search';
  onModeChange: (mode: 'chat' | 'search') => void;
  inputText: string;
  onInputTextChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
};

export function InputBar({
  mode,
  onModeChange,
  inputText,
  onInputTextChange,
  onSubmit,
  isSubmitDisabled,
}: InputBarProps) {
  return (
    <View style={styles.inputContainer}>
      <ModeToggle mode={mode} onModeChange={onModeChange} />
      <TextInput
        style={styles.textInput}
        value={inputText}
        onChangeText={onInputTextChange}
        placeholder={mode === 'chat' ? 'Ask me anything...' : 'Search your knowledge base...'}
        placeholderTextColor="#9CA3AF"
        multiline={mode === 'chat'}
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.sendButton, isSubmitDisabled && styles.sendButtonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <LinearGradient
          colors={
            !isSubmitDisabled
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
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
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
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bot, Search } from 'lucide-react-native';

type ModeToggleProps = {
  mode: 'chat' | 'search';
  onModeChange: (mode: 'chat' | 'search') => void;
};

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <View style={styles.modeToggle}>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'chat' && styles.modeButtonActive]}
        onPress={() => onModeChange('chat')}
        activeOpacity={0.7}
      >
        <Bot color={mode === 'chat' ? '#FFFFFF' : '#9CA3AF'} size={20} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modeButton, mode === 'search' && styles.modeButtonActiveSearch]}
        onPress={() => onModeChange('search')}
        activeOpacity={0.7}
      >
        <Search color={mode === 'search' ? '#FFFFFF' : '#9CA3AF'} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
}); 
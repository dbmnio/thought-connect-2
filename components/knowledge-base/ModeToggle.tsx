/**
 * @file This file defines the ModeToggle component, which allows switching between chat and search modes.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageSquare, Search } from 'lucide-react-native';

type ModeToggleProps = {
  mode: 'chat' | 'search';
  onModeChange: (mode: 'chat' | 'search') => void;
};

/**
 * A component that renders a toggle switch for changing between chat and search modes.
 *
 * @param {ModeToggleProps} props - The props for the component.
 * @param {string} props.mode - The current active mode ('chat' or 'search').
 * @param {function} props.onModeChange - The function to call when the mode is changed.
 * @returns {React.ReactElement} The rendered toggle component.
 */
export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const isChatActive = mode === 'chat';
  const isSearchActive = mode === 'search';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          isChatActive && styles.activeButton,
          isChatActive && { backgroundColor: '#6366F1' },
        ]}
        onPress={() => onModeChange('chat')}
      >
        <MessageSquare size={22} color={isChatActive ? '#FFFFFF' : '#6B7280'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          isSearchActive && styles.activeButton,
          isSearchActive && { backgroundColor: '#F59E0B' },
        ]}
        onPress={() => onModeChange('search')}
      >
        <Search size={22} color={isSearchActive ? '#FFFFFF' : '#6B7280'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 18,
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
}); 
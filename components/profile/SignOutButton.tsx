import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';

interface SignOutButtonProps {
  onSignOut: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
  return (
    <TouchableOpacity
      style={styles.signOutButton}
      onPress={onSignOut}
      activeOpacity={0.7}
    >
      <LogOut color="#EF4444" size={20} />
      <Text style={styles.signOutButtonText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF1F2',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 12,
  },
}); 
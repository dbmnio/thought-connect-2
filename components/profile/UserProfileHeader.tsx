import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Save, Edit3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UserProfileHeaderProps {
  isEditing: boolean;
  onBack: () => void;
  onSave: () => void;
  onEdit: () => void;
  loading: boolean;
}

export function UserProfileHeader({
  isEditing,
  onBack,
  onSave,
  onEdit,
  loading,
}: UserProfileHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ArrowLeft color="#6366F1" size={24} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Profile</Text>

      <TouchableOpacity
        style={styles.editButton}
        onPress={isEditing ? onSave : onEdit}
        disabled={loading}
      >
        {isEditing ? (
          <Save color="#6366F1" size={24} />
        ) : (
          <Edit3 color="#6366F1" size={24} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
}); 
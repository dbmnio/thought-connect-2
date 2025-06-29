import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';

interface ProfileSectionProps {
  isEditing: boolean;
  profile: {
    avatar_url?: string | null;
    full_name?: string;
    email?: string;
  } | null;
  editedName: string;
  setEditedName: (name: string) => void;
  editedEmail: string;
}

export function ProfileSection({
  isEditing,
  profile,
  editedName,
  setEditedName,
  editedEmail,
}: ProfileSectionProps) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <Avatar
          uri={profile?.avatar_url}
          name={profile?.full_name || 'User'}
          size="xlarge"
        />
        <TouchableOpacity style={styles.avatarEditButton}>
          <Camera color="#6366F1" size={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        {isEditing ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={editedEmail}
                editable={false}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.inputNote}>Email cannot be changed</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            <View style={styles.profileStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Thoughts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Teams</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>156</Text>
                <Text style={styles.statLabel}>Upvotes</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  inputDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  inputNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
}); 
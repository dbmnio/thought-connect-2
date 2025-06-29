import { useState } from 'react';
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileHeader } from '@/components/profile/UserProfileHeader';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { TeamManagementSection } from '@/components/profile/TeamManagementSection';
import { SettingsSection, SettingsOption } from '@/components/profile/SettingsSection';
import { SignOutButton } from '@/components/profile/SignOutButton';
import { Bell, Moon, Smartphone, Shield, HelpCircle, Globe, Settings, Camera } from 'lucide-react-native';

export default function UserProfile() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.full_name || '');
  const [editedEmail, setEditedEmail] = useState(profile?.email || user?.email || '');
  const [loading, setLoading] = useState(false);
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement profile update logic
      console.log('Saving profile...', { editedName });
      // await updateProfile({ full_name: editedName });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/sign-in');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const settingsOptions: SettingsOption[] = [
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Push notifications and alerts',
      type: 'switch' as const,
      value: notifications,
      onToggle: setNotifications,
    },
    {
      icon: Moon,
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      type: 'switch' as const,
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      icon: Smartphone,
      title: 'Auto Sync',
      subtitle: 'Automatically sync across devices',
      type: 'switch' as const,
      value: autoSync,
      onToggle: setAutoSync,
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Coming Soon', 'Help center will be available soon'),
    },
    {
      icon: Globe,
      title: 'Language',
      subtitle: 'English (US)',
      type: 'navigation' as const,
      onPress: () => Alert.alert('Coming Soon', 'Language settings will be available soon'),
    },
    {
      icon: Settings,
      title: 'Developer: Embedding Test',
      subtitle: 'Test OpenAI embedding generation',
      type: 'navigation' as const,
      onPress: () => router.push('/(app)/embedding-test'),
    },
    {
      icon: Camera,
      title: 'Developer: Camera Test',
      subtitle: 'Isolated camera for debugging',
      type: 'navigation' as const,
      onPress: () => router.push('/(app)/camera-test'),
    },
  ];

  return (
    <View style={styles.container}>
      <UserProfileHeader
        isEditing={isEditing}
        onBack={() => router.back()}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        loading={loading}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileSection
          isEditing={isEditing}
          profile={profile}
          editedName={editedName}
          setEditedName={setEditedName}
          editedEmail={editedEmail}
        />

        <TeamManagementSection />

        <SettingsSection settingsOptions={settingsOptions} />

        <SignOutButton onSignOut={handleSignOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
});
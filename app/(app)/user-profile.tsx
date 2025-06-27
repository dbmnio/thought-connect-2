import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Mail, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Save, Camera, Settings, Moon, Globe, Smartphone, Users } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';

export default function UserProfile() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile?.full_name || '');
  const [editedEmail, setEditedEmail] = useState(profile?.email || '');
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

  const settingsOptions = [
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
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#6366F1" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          disabled={loading}
        >
          {isEditing ? (
            <Save color="#6366F1" size={24} />
          ) : (
            <Edit3 color="#6366F1" size={24} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
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
                <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
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

        {/* Team Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teams</Text>
          
          <TouchableOpacity
            style={styles.teamManagementButton}
            onPress={() => router.push('/(app)/team-change')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.teamManagementGradient}>
              <View style={styles.teamManagementContent}>
                <View style={styles.teamManagementLeft}>
                  <View style={styles.teamManagementIcon}>
                    <Users color="#FFFFFF" size={24} />
                  </View>
                  <View style={styles.teamManagementText}>
                    <Text style={styles.teamManagementTitle}>Manage</Text>
                    <Text style={styles.teamManagementSubtitle}>
                      Manage teams you own
                    </Text>
                  </View>
                </View>
                <View style={styles.teamManagementArrow}>
                  <Text style={styles.teamManagementArrowText}>›</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Team create section */}
        <View>
        <TouchableOpacity
            style={styles.teamManagementButton}
            onPress={() => router.push('/(app)/stub')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.teamManagementGradient}>
              <View style={styles.teamManagementContent}>
                <View style={styles.teamManagementLeft}>
                  <View style={styles.teamManagementIcon}>
                    <Users color="#FFFFFF" size={24} />
                  </View>
                  <View style={styles.teamManagementText}>
                    <Text style={styles.teamManagementTitle}>Create</Text>
                    <Text style={styles.teamManagementSubtitle}>
                      Create a new team
                    </Text>
                  </View>
                </View>
                <View style={styles.teamManagementArrow}>
                  <Text style={styles.teamManagementArrowText}>›</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            
            return (
              <View key={index} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <IconComponent color="#6366F1" size={20} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{option.title}</Text>
                    <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                
                {option.type === 'switch' ? (
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.settingAction}
                    onPress={option.onPress}
                  >
                    <Text style={styles.settingActionText}>›</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Sign Out Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color="#EF4444" size={20} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginTop: 4,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  inputNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  teamManagementButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamManagementGradient: {
    padding: 20,
  },
  teamManagementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamManagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamManagementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamManagementText: {
    flex: 1,
  },
  teamManagementTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  teamManagementSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  teamManagementArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamManagementArrowText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  settingAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingActionText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
});
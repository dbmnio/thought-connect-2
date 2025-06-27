import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Users, Plus, LogOut, Check, Mail, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';

export default function TeamChange() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { currentTeam, teams, switchTeam, createTeam } = useTeam();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

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
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const validEmails = memberEmails.filter(email => 
      email.trim() && email.includes('@')
    );

    if (validEmails.length === 0) {
      Alert.alert('Error', 'Please add at least one valid email address');
      return;
    }

    setLoading(true);
    try {
      await createTeam(teamName.trim(), validEmails);
      setShowCreateModal(false);
      setTeamName('');
      setMemberEmails(['']);
      Alert.alert('Success', 'Team created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const addEmailField = () => {
    setMemberEmails(prev => [...prev, '']);
  };

  const updateEmail = (index: number, email: string) => {
    setMemberEmails(prev => {
      const updated = [...prev];
      updated[index] = email;
      return updated;
    });
  };

  const removeEmailField = (index: number) => {
    if (memberEmails.length > 1) {
      setMemberEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#6366F1" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teams</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>

        {/* Teams List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Teams</Text>
          <View style={styles.teamsList}>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={[
                  styles.teamCard,
                  currentTeam?.id === team.id && styles.teamCardActive,
                ]}
                onPress={() => switchTeam(team.id)}
              >
                <View style={styles.teamInfo}>
                  <View style={styles.teamIcon}>
                    <Users color={currentTeam?.id === team.id ? '#FFFFFF' : '#6366F1'} size={20} />
                  </View>
                  <View style={styles.teamDetails}>
                    <Text
                      style={[
                        styles.teamName,
                        currentTeam?.id === team.id && styles.teamNameActive,
                      ]}
                    >
                      {team.name}
                    </Text>
                    <Text
                      style={[
                        styles.teamMembers,
                        currentTeam?.id === team.id && styles.teamMembersActive,
                      ]}
                    >
                      {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                {currentTeam?.id === team.id && (
                  <Check color="#FFFFFF" size={20} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Team Button */}
        <TouchableOpacity
          style={styles.createTeamButton}
          onPress={() => setShowCreateModal(true)}
        >
          <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.createTeamGradient}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.createTeamText}>Create New Team</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCreateModal(false)}
            >
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Team</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Team Name</Text>
              <TextInput
                style={styles.input}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Members</Text>
              {memberEmails.map((email, index) => (
                <View key={index} style={styles.emailInputContainer}>
                  <Mail color="#9CA3AF" size={20} />
                  <TextInput
                    style={styles.emailInput}
                    value={email}
                    onChangeText={(text) => updateEmail(index, text)}
                    placeholder="email@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {memberEmails.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeEmailField(index)}
                      style={styles.removeEmailButton}
                    >
                      <X color="#EF4444" size={16} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity style={styles.addEmailButton} onPress={addEmailField}>
                <Plus color="#6366F1" size={16} />
                <Text style={styles.addEmailText}>Add another email</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreateTeam}
              disabled={loading}
            >
              <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.createButtonGradient}>
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Team'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  teamsList: {
    gap: 8,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  teamCardActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  teamNameActive: {
    color: '#FFFFFF',
  },
  teamMembers: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  teamMembersActive: {
    color: '#E5E7EB',
  },
  createTeamButton: {
    marginTop: 20,
  },
  createTeamGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createTeamText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 60,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
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
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  },
  emailInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  removeEmailButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  addEmailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    width: '100%',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
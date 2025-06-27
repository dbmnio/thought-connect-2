import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  LogOut, 
  Check, 
  Mail, 
  X, 
  SquareCheck as CheckSquare, 
  Square,
  Crown,
  Clock,
  UserPlus,
  Settings,
  Trash2,
  UserMinus,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { TeamCard } from '@/components/team/TeamCard';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

type TabType = 'my-teams' | 'invitations' | 'created-teams';

export default function TeamChange() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { 
    selectedTeams, 
    allTeams, 
    pendingInvitations,
    loading,
    toggleTeamSelection, 
    selectAllTeams, 
    selectNoTeams, 
    isTeamSelected, 
    createTeam,
    acceptInvitation,
    declineInvitation,
    leaveTeam,
    deleteTeam,
    isTeamOwner,
    refreshTeams,
  } = useTeam();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<TabType>('my-teams');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState<string[]>(['']);
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Action sheet state
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'leave' | 'delete' | 'decline';
    teamId: string;
    teamName: string;
  } | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    const validEmails = memberEmails.filter(email => 
      email.trim() && email.includes('@')
    );

    setCreateLoading(true);
    setError(null);
    
    try {
      await createTeam(teamName.trim(), teamDescription.trim() || undefined, validEmails);
      setShowCreateModal(false);
      setTeamName('');
      setTeamDescription('');
      setMemberEmails(['']);
    } catch (error: any) {
      setError(error.message || 'Failed to create team');
    } finally {
      setCreateLoading(false);
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

  const handleSelectAll = () => {
    if (selectedTeams.length === allTeams.length) {
      selectNoTeams();
    } else {
      selectAllTeams();
    }
  };

  const handleTeamMenuPress = (teamId: string) => {
    setSelectedTeamId(teamId);
    setShowActionSheet(true);
  };

  const handleAcceptInvitation = async (teamId: string) => {
    try {
      await acceptInvitation(teamId);
    } catch (error: any) {
      setError(error.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = (teamId: string, teamName: string) => {
    setConfirmAction({ type: 'decline', teamId, teamName });
    setShowConfirmDialog(true);
  };

  const handleLeaveTeam = (teamId: string, teamName: string) => {
    setConfirmAction({ type: 'leave', teamId, teamName });
    setShowConfirmDialog(true);
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    setConfirmAction({ type: 'delete', teamId, teamName });
    setShowConfirmDialog(true);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'leave':
          await leaveTeam(confirmAction.teamId);
          break;
        case 'delete':
          await deleteTeam(confirmAction.teamId);
          break;
        case 'decline':
          await declineInvitation(confirmAction.teamId);
          break;
      }
    } catch (error: any) {
      setError(error.message || 'Action failed');
    } finally {
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  };

  const getActionSheetOptions = () => {
    if (!selectedTeamId) return [];

    const team = allTeams.find(t => t.id === selectedTeamId);
    if (!team) return [];

    const options = [];

    if (isTeamOwner(selectedTeamId)) {
      options.push(
        {
          label: 'Team Settings',
          onPress: () => {
            // TODO: Navigate to team settings
            console.log('Team settings');
          },
        },
        {
          label: 'Invite Members',
          onPress: () => {
            // TODO: Open invite modal
            console.log('Invite members');
          },
        },
        {
          label: 'Delete Team',
          onPress: () => handleDeleteTeam(selectedTeamId, team.name),
          destructive: true,
        }
      );
    } else {
      options.push({
        label: 'Leave Team',
        onPress: () => handleLeaveTeam(selectedTeamId, team.name),
        destructive: true,
      });
    }

    return options;
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'my-teams':
        return (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Teams</Text>
              <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
                <Text style={styles.selectAllText}>
                  {selectedTeams.length === allTeams.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>
              Selected: {selectedTeams.length} of {allTeams.length} teams
            </Text>

            <View style={styles.teamsList}>
              {allTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={isTeamSelected(team.id)}
                  onPress={() => toggleTeamSelection(team.id)}
                  onMenuPress={() => handleTeamMenuPress(team.id)}
                />
              ))}
            </View>
          </View>
        );

      case 'invitations':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Pending Invitations</Text>
            <Text style={styles.sectionSubtitle}>
              {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? 's' : ''} waiting for your response
            </Text>

            <View style={styles.invitationsList}>
              {pendingInvitations.map((invitation) => (
                <View key={invitation.id} style={styles.invitationCard}>
                  <View style={styles.invitationHeader}>
                    <Avatar
                      uri={invitation.team.avatar_url}
                      name={invitation.team.name}
                      size="medium"
                    />
                    <View style={styles.invitationInfo}>
                      <Text style={styles.invitationTeamName}>
                        {invitation.team.name}
                      </Text>
                      <Text style={styles.invitationText}>
                        Invited by {invitation.inviter_name}
                      </Text>
                      {invitation.team.description && (
                        <Text style={styles.invitationDescription}>
                          {invitation.team.description}
                        </Text>
                      )}
                    </View>
                    <Badge variant="warning" size="small">
                      <Clock color="#D97706" size={12} />
                      <Text style={{ marginLeft: 4 }}>Pending</Text>
                    </Badge>
                  </View>

                  <View style={styles.invitationActions}>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineInvitation(invitation.team.id, invitation.team.name)}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptInvitation(invitation.team.id)}
                    >
                      <LinearGradient colors={['#10B981', '#059669']} style={styles.acceptButtonGradient}>
                        <Check color="#FFFFFF" size={16} />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {pendingInvitations.length === 0 && (
                <View style={styles.emptyState}>
                  <Clock color="#9CA3AF" size={48} />
                  <Text style={styles.emptyTitle}>No pending invitations</Text>
                  <Text style={styles.emptyDescription}>
                    You'll see team invitations here when someone invites you to join their team.
                  </Text>
                </View>
              )}
            </View>
          </View>
        );

      case 'created-teams':
        const createdTeams = allTeams.filter(team => team.user_role === 'owner');
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Teams You Created</Text>
            <Text style={styles.sectionSubtitle}>
              {createdTeams.length} team{createdTeams.length !== 1 ? 's' : ''} under your management
            </Text>

            <View style={styles.teamsList}>
              {createdTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={isTeamSelected(team.id)}
                  onPress={() => toggleTeamSelection(team.id)}
                  onMenuPress={() => handleTeamMenuPress(team.id)}
                />
              ))}
            </View>

            {createdTeams.length === 0 && (
              <View style={styles.emptyState}>
                <Crown color="#9CA3AF" size={48} />
                <Text style={styles.emptyTitle}>No teams created yet</Text>
                <Text style={styles.emptyDescription}>
                  Create your first team to start collaborating with others.
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { key: 'my-teams' as TabType, label: 'My Teams', count: allTeams.length },
    { key: 'invitations' as TabType, label: 'Invitations', count: pendingInvitations.length },
    { key: 'created-teams' as TabType, label: 'Created', count: allTeams.filter(t => t.user_role === 'owner').length },
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
        <Text style={styles.headerTitle}>Team Management</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* User Info */}
        <View style={styles.userCard}>
          <Avatar
            uri={profile?.avatar_url}
            name={profile?.full_name}
            size="large"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
            <View style={styles.userStats}>
              <Text style={styles.userStat}>{allTeams.length} teams</Text>
              <Text style={styles.userStatDivider}>•</Text>
              <Text style={styles.userStat}>{pendingInvitations.length} invitations</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <X color="#DC2626" size={16} />
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    activeTab === tab.key && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.key && styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {tab.count > 0 && (
                    <Badge 
                      variant={activeTab === tab.key ? 'primary' : 'secondary'} 
                      size="small"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tab Content */}
        {getTabContent()}

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
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowCreateModal(false);
                setError(null);
              }}
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
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={teamDescription}
                onChangeText={setTeamDescription}
                placeholder="What's this team about?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invite Members (Optional)</Text>
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
              style={[styles.createButton, createLoading && styles.createButtonDisabled]}
              onPress={handleCreateTeam}
              disabled={createLoading}
            >
              <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.createButtonGradient}>
                <Text style={styles.createButtonText}>
                  {createLoading ? 'Creating...' : 'Create Team'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Team Actions"
        options={getActionSheetOptions()}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showConfirmDialog}
        title={
          confirmAction?.type === 'delete' 
            ? 'Delete Team' 
            : confirmAction?.type === 'leave'
            ? 'Leave Team'
            : 'Decline Invitation'
        }
        message={
          confirmAction?.type === 'delete'
            ? `Are you sure you want to delete "${confirmAction.teamName}"? This action cannot be undone and all team data will be lost.`
            : confirmAction?.type === 'leave'
            ? `Are you sure you want to leave "${confirmAction.teamName}"? You'll need to be re-invited to rejoin.`
            : `Are you sure you want to decline the invitation to join "${confirmAction?.teamName}"?`
        }
        confirmText={
          confirmAction?.type === 'delete' 
            ? 'Delete' 
            : confirmAction?.type === 'leave'
            ? 'Leave'
            : 'Decline'
        }
        destructive={confirmAction?.type !== 'decline'}
        onConfirm={executeConfirmAction}
        onCancel={() => {
          setShowConfirmDialog(false);
          setConfirmAction(null);
        }}
      />
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStat: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  userStatDivider: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#E5E7EB',
    marginHorizontal: 8,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  tabsContainer: {
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  selectAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6366F1',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  teamsList: {
    gap: 8,
  },
  invitationsList: {
    gap: 12,
  },
  invitationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  invitationInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  invitationTeamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  invitationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  invitationDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  acceptButton: {
    flex: 1,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  createTeamButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  createTeamGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
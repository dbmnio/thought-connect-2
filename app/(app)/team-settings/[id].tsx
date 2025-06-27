import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Settings, Users, UserPlus, Mail, Crown, Shield, Trash2, CreditCard as Edit3, Save, X, Check, TriangleAlert as AlertTriangle, Camera, MoveVertical as MoreVertical, UserMinus, LogOut } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

interface TeamMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  invitation_status: 'pending' | 'accepted' | 'declined';
  joined_at: string;
  profile: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

interface TeamDetails {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  member_limit: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function TeamSettings() {
  const router = useRouter();
  const { id: teamId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    allTeams, 
    isTeamOwner, 
    updateTeam, 
    deleteTeam, 
    inviteMembers, 
    removeMember, 
    leaveTeam, 
    getTeamMembers,
    transferOwnership,
  } = useTeam();
  const insets = useSafeAreaInsets();

  // State
  const [team, setTeam] = useState<TeamDetails | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedMemberLimit, setEditedMemberLimit] = useState('50');

  // Invitation modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Action sheet and confirmation
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'transfer' | 'delete' | 'leave';
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  const isOwner = teamId ? isTeamOwner(teamId) : false;

  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
  }, [teamId]);

  const loadTeamData = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);

      // Find team in allTeams
      const foundTeam = allTeams.find(t => t.id === teamId);
      if (!foundTeam) {
        setError('Team not found');
        return;
      }

      setTeam(foundTeam as TeamDetails);
      setEditedName(foundTeam.name);
      setEditedDescription(foundTeam.description || '');
      setEditedMemberLimit(foundTeam.member_limit?.toString() || '50');

      // Load team members
      const teamMembers = await getTeamMembers(teamId);
      setMembers(teamMembers);
    } catch (error: any) {
      setError(error.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeamData();
    setRefreshing(false);
  };

  const handleSaveChanges = async () => {
    if (!team || !teamId) return;

    try {
      setLoading(true);
      await updateTeam(teamId, {
        name: editedName.trim(),
        description: editedDescription.trim() || null,
        member_limit: parseInt(editedMemberLimit) || 50,
      });
      
      setIsEditing(false);
      await loadTeamData();
    } catch (error: any) {
      setError(error.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMembers = async () => {
    if (!teamId) return;

    const validEmails = inviteEmails.filter(email => 
      email.trim() && email.includes('@')
    );

    if (validEmails.length === 0) {
      setError('Please enter valid email addresses');
      return;
    }

    try {
      setInviteLoading(true);
      setError(null);
      await inviteMembers(teamId, validEmails);
      setShowInviteModal(false);
      setInviteEmails(['']);
      await loadTeamData();
    } catch (error: any) {
      setError(error.message || 'Failed to send invitations');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleMemberAction = (member: TeamMember) => {
    setSelectedMember(member);
    setShowActionSheet(true);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!teamId) return;
    
    try {
      await removeMember(teamId, memberId);
      await loadTeamData();
    } catch (error: any) {
      setError(error.message || 'Failed to remove member');
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!teamId) return;
    
    try {
      await transferOwnership(teamId, newOwnerId);
      await loadTeamData();
    } catch (error: any) {
      setError(error.message || 'Failed to transfer ownership');
    }
  };

  const handleLeaveTeam = async () => {
    if (!teamId) return;
    
    try {
      await leaveTeam(teamId);
      router.back();
    } catch (error: any) {
      setError(error.message || 'Failed to leave team');
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId) return;
    
    try {
      await deleteTeam(teamId);
      router.back();
    } catch (error: any) {
      setError(error.message || 'Failed to delete team');
    }
  };

  const getActionSheetOptions = () => {
    if (!selectedMember || !user) return [];

    const options = [];

    if (isOwner && selectedMember.user_id !== user.id) {
      if (selectedMember.role === 'member') {
        options.push({
          label: 'Transfer Ownership',
          onPress: () => {
            setConfirmAction({
              type: 'transfer',
              title: 'Transfer Ownership',
              message: `Are you sure you want to transfer ownership to ${selectedMember.profile.full_name}? You will become a regular member.`,
              action: () => handleTransferOwnership(selectedMember.user_id),
            });
            setShowConfirmDialog(true);
          },
        });
      }

      options.push({
        label: 'Remove from Team',
        onPress: () => {
          setConfirmAction({
            type: 'remove',
            title: 'Remove Member',
            message: `Are you sure you want to remove ${selectedMember.profile.full_name} from the team?`,
            action: () => handleRemoveMember(selectedMember.user_id),
          });
          setShowConfirmDialog(true);
        },
        destructive: true,
      });
    }

    return options;
  };

  const addEmailField = () => {
    setInviteEmails(prev => [...prev, '']);
  };

  const updateEmail = (index: number, email: string) => {
    setInviteEmails(prev => {
      const updated = [...prev];
      updated[index] = email;
      return updated;
    });
  };

  const removeEmailField = (index: number) => {
    if (inviteEmails.length > 1) {
      setInviteEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (loading && !team) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading team settings...</Text>
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#6366F1" size={24} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Team Settings</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <X color="#6366F1" size={24} />
          ) : (
            <Edit3 color="#6366F1" size={24} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Error Display */}
        {error && (
          <View style={styles.errorBanner}>
            <AlertTriangle color="#DC2626" size={20} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <X color="#DC2626" size={16} />
            </TouchableOpacity>
          </View>
        )}

        {/* Team Info Section */}
        <View style={styles.section}>
          <View style={styles.teamHeader}>
            <Avatar
              uri={team?.avatar_url}
              name={team?.name || ''}
              size="xlarge"
            />
            <TouchableOpacity style={styles.avatarEditButton}>
              <Camera color="#6366F1" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.teamInfo}>
            {isEditing ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Team Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Enter team name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editedDescription}
                    onChangeText={setEditedDescription}
                    placeholder="Team description (optional)"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Member Limit</Text>
                  <TextInput
                    style={styles.input}
                    value={editedMemberLimit}
                    onChangeText={setEditedMemberLimit}
                    placeholder="50"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                  disabled={loading}
                >
                  <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.saveButtonGradient}>
                    <Save color="#FFFFFF" size={16} />
                    <Text style={styles.saveButtonText}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.teamName}>{team?.name || ''}</Text>
                {team?.description && (
                  <Text style={styles.teamDescription}>{team.description}</Text>
                )}
                <View style={styles.teamStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{members.length}</Text>
                    <Text style={styles.statLabel}>Members</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{team?.member_limit || 0}</Text>
                    <Text style={styles.statLabel}>Limit</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {team?.created_at ? new Date(team.created_at).toLocaleDateString() : ''}
                    </Text>
                    <Text style={styles.statLabel}>Created</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Users color="#6366F1" size={20} />
              <Text style={styles.sectionTitle}>Members ({members.length})</Text>
            </View>
            {isOwner && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={() => setShowInviteModal(true)}
              >
                <UserPlus color="#6366F1" size={16} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <Avatar
                  uri={member.profile.avatar_url}
                  name={member.profile.full_name}
                  size="medium"
                />
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.profile.full_name}</Text>
                  <Text style={styles.memberEmail}>{member.profile.email}</Text>
                  <View style={styles.memberMeta}>
                    <Badge 
                      variant={member.role === 'owner' ? 'warning' : 'secondary'} 
                      size="small"
                    >
                      {member.role === 'owner' ? (
                        <>
                          <Crown color="#D97706" size={12} />
                          <Text style={{ marginLeft: 4 }}>Owner</Text>
                        </>
                      ) : (
                        <>
                          <Shield color="#64748B" size={12} />
                          <Text style={{ marginLeft: 4 }}>Member</Text>
                        </>
                      )}
                    </Badge>
                    {member.invitation_status === 'pending' && (
                      <Badge variant="info" size="small">
                        Pending
                      </Badge>
                    )}
                  </View>
                </View>

                {isOwner && member.user_id !== user?.id && (
                  <TouchableOpacity
                    style={styles.memberActionButton}
                    onPress={() => handleMemberAction(member)}
                  >
                    <MoreVertical color="#9CA3AF" size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.dangerZone}>
            <View style={styles.sectionTitleContainer}>
              <AlertTriangle color="#DC2626" size={20} />
              <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
            </View>

            {isOwner ? (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => {
                  setConfirmAction({
                    type: 'delete',
                    title: 'Delete Team',
                    message: `Are you sure you want to delete "${team?.name || 'this team'}"? This action cannot be undone and all team data will be lost.`,
                    action: handleDeleteTeam,
                  });
                  setShowConfirmDialog(true);
                }}
              >
                <Trash2 color="#DC2626" size={16} />
                <Text style={styles.dangerButtonText}>Delete Team</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => {
                  setConfirmAction({
                    type: 'leave',
                    title: 'Leave Team',
                    message: `Are you sure you want to leave "${team?.name || 'this team'}"? You'll need to be re-invited to rejoin.`,
                    action: handleLeaveTeam,
                  });
                  setShowConfirmDialog(true);
                }}
              >
                <LogOut color="#DC2626" size={16} />
                <Text style={styles.dangerButtonText}>Leave Team</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Invite Members Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowInviteModal(false);
                setInviteEmails(['']);
                setError(null);
              }}
            >
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Members</Text>
            <View style={styles.modalHeaderRight} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Invite new members to join "{team?.name || 'this team'}" by entering their email addresses.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Addresses</Text>
              {inviteEmails.map((email, index) => (
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
                  {inviteEmails.length > 1 && (
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
                <UserPlus color="#6366F1" size={16} />
                <Text style={styles.addEmailText}>Add another email</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.inviteSubmitButton, inviteLoading && styles.inviteSubmitButtonDisabled]}
              onPress={handleInviteMembers}
              disabled={inviteLoading}
            >
              <LinearGradient colors={['#6366F1', '#3B82F6']} style={styles.inviteSubmitButtonGradient}>
                <Text style={styles.inviteSubmitButtonText}>
                  {inviteLoading ? 'Sending Invitations...' : 'Send Invitations'}
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
        title="Member Actions"
        options={getActionSheetOptions()}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showConfirmDialog}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText={confirmAction?.type === 'delete' ? 'Delete' : confirmAction?.type === 'remove' ? 'Remove' : 'Confirm'}
        destructive={confirmAction?.type !== 'transfer'}
        onConfirm={async () => {
          if (confirmAction) {
            await confirmAction.action();
          }
          setShowConfirmDialog(false);
          setConfirmAction(null);
        }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6366F1',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
  headerButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
  teamHeader: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  teamInfo: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
    marginBottom: 20,
    width: '100%',
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
  saveButton: {
    width: '100%',
    marginTop: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  inviteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  memberMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  memberActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FEF2F2',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
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
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
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
  inviteSubmitButton: {
    width: '100%',
  },
  inviteSubmitButtonDisabled: {
    opacity: 0.7,
  },
  inviteSubmitButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inviteSubmitButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
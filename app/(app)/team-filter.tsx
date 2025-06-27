import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Check, Users, Crown, Clock } from 'lucide-react-native';
import { useTeam } from '@/hooks/useTeam';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export default function TeamFilter() {
  const router = useRouter();
  const { 
    selectedTeams, 
    allTeams, 
    pendingInvitations,
    toggleTeamSelection, 
    selectAllTeams, 
    selectNoTeams, 
    isTeamSelected,
    loading,
  } = useTeam();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = allTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedTeams.length === allTeams.length) {
      selectNoTeams();
    } else {
      selectAllTeams();
    }
  };

  const getDisplayText = () => {
    if (selectedTeams.length === 0) return 'No Teams Selected';
    if (selectedTeams.length === 1) return `${selectedTeams[0].name} Selected`;
    return `${selectedTeams.length} Teams Selected`;
  };

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
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Filter Teams</Text>
          <Text style={styles.headerSubtitle}>{getDisplayText()}</Text>
        </View>
        
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleSelectAll}
          >
            <Text style={styles.quickActionText}>
              {selectedTeams.length === allTeams.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(app)/team-change')}
          >
            <Text style={styles.quickActionText}>Manage Teams</Text>
          </TouchableOpacity>
        </View>

        {/* Teams List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Teams ({filteredTeams.length})</Text>
          
          {filteredTeams.map((team) => (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamCard,
                isTeamSelected(team.id) && styles.teamCardSelected,
              ]}
              onPress={() => toggleTeamSelection(team.id)}
              activeOpacity={0.7}
            >
              <View style={styles.teamLeft}>
                <Avatar
                  uri={team.avatar_url}
                  name={team.name}
                  size="medium"
                />
                
                <View style={styles.teamInfo}>
                  <View style={styles.teamNameRow}>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {team.name}
                    </Text>
                    {team.user_role === 'owner' && (
                      <Crown color="#F59E0B" size={14} />
                    )}
                  </View>
                  
                  {team.description && (
                    <Text style={styles.teamDescription} numberOfLines={1}>
                      {team.description}
                    </Text>
                  )}
                  
                  <View style={styles.teamMeta}>
                    <Text style={styles.teamMemberCount}>
                      {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                    </Text>
                    <Badge 
                      variant={team.user_role === 'owner' ? 'warning' : 'secondary'} 
                      size="small"
                    >
                      {team.user_role === 'owner' ? 'Owner' : 'Member'}
                    </Badge>
                  </View>
                </View>
              </View>

              <View style={styles.teamRight}>
                <View
                  style={[
                    styles.checkbox,
                    isTeamSelected(team.id) && styles.checkboxSelected,
                  ]}
                >
                  {isTeamSelected(team.id) && (
                    <Check color="#FFFFFF" size={16} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredTeams.length === 0 && searchQuery && (
            <View style={styles.emptyState}>
              <Search color="#9CA3AF" size={48} />
              <Text style={styles.emptyTitle}>No teams found</Text>
              <Text style={styles.emptyDescription}>
                No teams match your search criteria
              </Text>
            </View>
          )}
        </View>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Invitations ({pendingInvitations.length})
            </Text>
            
            {pendingInvitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.teamLeft}>
                  <Avatar
                    uri={invitation.team.avatar_url}
                    name={invitation.team.name}
                    size="medium"
                  />
                  
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {invitation.team.name}
                    </Text>
                    <Text style={styles.invitationText}>
                      Invited by {invitation.inviter_name}
                    </Text>
                    {invitation.team.description && (
                      <Text style={styles.teamDescription} numberOfLines={1}>
                        {invitation.team.description}
                      </Text>
                    )}
                  </View>
                </View>

                <Badge variant="warning" size="small">
                  <Clock color="#D97706" size={12} />
                  <Text style={{ marginLeft: 4 }}>Pending</Text>
                </Badge>
              </View>
            ))}
          </View>
        )}

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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366F1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teamCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    flex: 1,
  },
  teamDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamMemberCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  teamRight: {
    marginLeft: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  invitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  invitationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    marginBottom: 4,
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
  },
});
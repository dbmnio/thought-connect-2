import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Users, MoveVertical as MoreVertical, Crown, Clock } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Database } from '@/types/database';

type Team = Database['public']['Tables']['teams']['Row'] & {
  member_count: number;
  user_role: 'owner' | 'member';
  invitation_status: 'pending' | 'accepted' | 'declined';
  recent_members?: Array<{
    id: string;
    full_name: string;
    avatar_url: string | null;
  }>;
};

interface TeamCardProps {
  team: Team;
  onPress: () => void;
  onMenuPress: () => void;
  isSelected?: boolean;
}

export function TeamCard({ team, onPress, onMenuPress, isSelected = false }: TeamCardProps) {
  const getStatusBadge = () => {
    if (team.invitation_status === 'pending') {
      return <Badge variant="warning" size="small">Invited</Badge>;
    }
    if (team.user_role === 'owner') {
      return <Badge variant="primary" size="small">Owner</Badge>;
    }
    return <Badge variant="secondary" size="small">Member</Badge>;
  };

  const getTeamIcon = () => {
    if (team.user_role === 'owner') {
      return <Crown color="#F59E0B" size={16} />;
    }
    if (team.invitation_status === 'pending') {
      return <Clock color="#F59E0B" size={16} />;
    }
    return <Users color="#6366F1" size={16} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.selectedCard,
        team.invitation_status === 'pending' && styles.pendingCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.teamInfo}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={team.avatar_url}
              name={team.name}
              size="medium"
            />
            <View style={styles.iconBadge}>
              {getTeamIcon()}
            </View>
          </View>
          
          <View style={styles.teamDetails}>
            <Text style={styles.teamName} numberOfLines={1}>
              {team.name}
            </Text>
            {team.description && (
              <Text style={styles.teamDescription} numberOfLines={1}>
                {team.description}
              </Text>
            )}
            <View style={styles.memberInfo}>
              <Text style={styles.memberCount}>
                {team.member_count} member{team.member_count !== 1 ? 's' : ''}
              </Text>
              {team.recent_members && team.recent_members.length > 0 && (
                <View style={styles.memberAvatars}>
                  {team.recent_members.slice(0, 3).map((member, index) => (
                    <Avatar
                      key={member.id}
                      uri={member.avatar_url}
                      name={member.full_name}
                      size="small"
                      style={[
                        styles.memberAvatar,
                        { marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    />
                  ))}
                  {team.member_count > 3 && (
                    <View style={[styles.memberAvatar, styles.moreMembers]}>
                      <Text style={styles.moreMembersText}>
                        +{team.member_count - 3}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {getStatusBadge()}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onMenuPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MoreVertical color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {team.invitation_status === 'pending' && (
        <View style={styles.invitationBanner}>
          <Clock color="#F59E0B" size={16} />
          <Text style={styles.invitationText}>
            You've been invited to join this team
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  selectedCard: {
    borderColor: '#6366F1',
    backgroundColor: '#F8FAFF',
  },
  pendingCard: {
    borderColor: '#FCD34D',
    backgroundColor: '#FFFBEB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  teamDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 6,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreMembers: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  moreMembersText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FCD34D',
  },
  invitationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
    flex: 1,
  },
});
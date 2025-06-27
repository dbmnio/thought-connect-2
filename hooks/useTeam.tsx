import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
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

type TeamMember = Database['public']['Tables']['team_members']['Row'] & {
  profile: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
};

type Invitation = {
  id: string;
  team: Team;
  inviter_name: string;
  created_at: string;
};

interface TeamContextType {
  selectedTeams: Team[];
  allTeams: Team[];
  pendingInvitations: Invitation[];
  loading: boolean;
  
  // Team selection
  toggleTeamSelection: (teamId: string) => void;
  selectAllTeams: () => void;
  selectNoTeams: () => void;
  isTeamSelected: (teamId: string) => boolean;
  
  // Team management
  createTeam: (name: string, description?: string, memberEmails?: string[]) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  
  // Member management
  inviteMembers: (teamId: string, emails: string[]) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  transferOwnership: (teamId: string, newOwnerId: string) => Promise<void>;
  getTeamMembers: (teamId: string) => Promise<TeamMember[]>;
  
  // Invitation management
  acceptInvitation: (teamId: string) => Promise<void>;
  declineInvitation: (teamId: string) => Promise<void>;
  
  // Utility methods
  isTeamOwner: (teamId: string) => boolean;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchPendingInvitations();
    }
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all team memberships for the user (accepted only)
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          invitation_status,
          teams (
            id,
            name,
            description,
            avatar_url,
            member_limit,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('invitation_status', 'accepted');

      if (membershipError) throw membershipError;

      // Enrich teams with member data
      const teamsWithData = await Promise.all(
        memberships.map(async (membership) => {
          const team = membership.teams as any;
          
          // Get member count
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
            .eq('invitation_status', 'accepted');

          // Get recent members for avatar display
          const { data: recentMembers } = await supabase
            .from('team_members')
            .select(`
              profiles (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('team_id', team.id)
            .eq('invitation_status', 'accepted')
            .order('joined_at', { ascending: false })
            .limit(4);

          return {
            ...team,
            member_count: count || 0,
            user_role: membership.role,
            invitation_status: membership.invitation_status,
            recent_members: recentMembers?.map(m => (m.profiles as any)) || [],
          };
        })
      );

      setAllTeams(teamsWithData);
      
      // Auto-select teams if none selected
      if (selectedTeams.length === 0 && teamsWithData.length > 0) {
        const personalTeam = teamsWithData.find(t => t.name === 'Personal');
        if (personalTeam) {
          setSelectedTeams([personalTeam]);
        } else {
          setSelectedTeams([teamsWithData[0]]);
        }
      } else {
        // Update selected teams with fresh data
        const updatedSelectedTeams = selectedTeams
          .map(selectedTeam => teamsWithData.find(t => t.id === selectedTeam.id))
          .filter(Boolean) as Team[];
        setSelectedTeams(updatedSelectedTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          joined_at,
          teams (
            id,
            name,
            description,
            avatar_url,
            created_by,
            profiles!teams_created_by_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending');

      if (error) throw error;

      const invitations = data.map(item => ({
        id: item.id,
        team: {
          ...(item.teams as any),
          member_count: 0,
          user_role: 'member' as const,
          invitation_status: 'pending' as const,
        },
        inviter_name: (item.teams as any)?.profiles?.full_name || 'Unknown',
        created_at: item.joined_at,
      }));

      setPendingInvitations(invitations);
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    const team = allTeams.find(t => t.id === teamId);
    if (!team) return;

    setSelectedTeams(prev => {
      const isSelected = prev.some(t => t.id === teamId);
      if (isSelected) {
        if (prev.length === 1) return prev; // Don't allow deselecting all teams
        return prev.filter(t => t.id !== teamId);
      } else {
        return [...prev, team];
      }
    });
  };

  const selectAllTeams = () => {
    setSelectedTeams([...allTeams]);
  };

  const selectNoTeams = () => {
    const personalTeam = allTeams.find(t => t.name === 'Personal');
    if (personalTeam) {
      setSelectedTeams([personalTeam]);
    } else if (allTeams.length > 0) {
      setSelectedTeams([allTeams[0]]);
    }
  };

  const isTeamSelected = (teamId: string) => {
    return selectedTeams.some(t => t.id === teamId);
  };

  const createTeam = async (name: string, description?: string, memberEmails: string[] = []) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Validate member emails if provided
      if (memberEmails.length > 0) {
        const validEmails = memberEmails
          .map(email => email.trim().toLowerCase())
          .filter(email => email && email.includes('@'));

        if (validEmails.length > 0) {
          const emailValidationResults = await Promise.all(
            validEmails.map(async (email) => {
              const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .eq('email', email);

              if (error) throw error;

              return {
                email,
                exists: data && data.length > 0,
                profile: data && data.length > 0 ? data[0] : null
              };
            })
          );

          const nonExistentEmails = emailValidationResults
            .filter(result => !result.exists)
            .map(result => result.email);

          if (nonExistentEmails.length > 0) {
            throw new Error(
              `The following email${nonExistentEmails.length > 1 ? 's are' : ' is'} not associated with any user account: ${nonExistentEmails.join(', ')}`
            );
          }
        }
      }

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as owner
      const { error: ownerError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: user.id,
          role: 'owner',
          invitation_status: 'accepted',
        });

      if (ownerError) throw ownerError;

      // Invite members if provided
      if (memberEmails.length > 0) {
        await inviteMembers(teamData.id, memberEmails);
      }

      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .eq('created_by', user.id);

      if (error) throw error;
      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('created_by', user.id);

      if (error) throw error;
      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const inviteMembers = async (teamId: string, emails: string[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const validEmails = emails
        .map(email => email.trim().toLowerCase())
        .filter(email => email && email.includes('@'));

      if (validEmails.length === 0) {
        throw new Error('Please provide valid email addresses');
      }

      // Get user profiles for the emails
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', validEmails);

      if (profileError) throw profileError;

      const foundEmails = profiles.map(p => p.email);
      const notFoundEmails = validEmails.filter(email => !foundEmails.includes(email));

      if (notFoundEmails.length > 0) {
        throw new Error(`Users not found for emails: ${notFoundEmails.join(', ')}`);
      }

      // Create pending invitations
      const invitations = profiles.map(profile => ({
        team_id: teamId,
        user_id: profile.id,
        role: 'member' as const,
        invitation_status: 'pending' as const,
      }));

      const { error: inviteError } = await supabase
        .from('team_members')
        .insert(invitations);

      if (inviteError) throw inviteError;

      await fetchPendingInvitations();
    } catch (error) {
      throw error;
    }
  };

  const acceptInvitation = async (teamId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ invitation_status: 'accepted' })
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending');

      if (error) throw error;

      await fetchTeams();
      await fetchPendingInvitations();
    } catch (error) {
      throw error;
    }
  };

  const declineInvitation = async (teamId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending');

      if (error) throw error;
      await fetchPendingInvitations();
    } catch (error) {
      throw error;
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const leaveTeam = async (teamId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const transferOwnership = async (teamId: string, newOwnerId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Update team creator
      const { error: teamError } = await supabase
        .from('teams')
        .update({ created_by: newOwnerId })
        .eq('id', teamId)
        .eq('created_by', user.id);

      if (teamError) throw teamError;

      // Update roles
      const { error: roleError } = await supabase
        .from('team_members')
        .update({ role: 'owner' })
        .eq('team_id', teamId)
        .eq('user_id', newOwnerId);

      if (roleError) throw roleError;

      const { error: currentOwnerError } = await supabase
        .from('team_members')
        .update({ role: 'member' })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (currentOwnerError) throw currentOwnerError;

      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .eq('invitation_status', 'accepted')
        .order('role', { ascending: false })
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    } catch (error) {
      throw error;
    }
  };

  const isTeamOwner = (teamId: string) => {
    const team = allTeams.find(t => t.id === teamId);
    return team?.user_role === 'owner';
  };

  return (
    <TeamContext.Provider
      value={{
        selectedTeams,
        allTeams,
        pendingInvitations,
        loading,
        toggleTeamSelection,
        selectAllTeams,
        selectNoTeams,
        isTeamSelected,
        createTeam,
        updateTeam,
        deleteTeam,
        inviteMembers,
        removeMember,
        leaveTeam,
        transferOwnership,
        getTeamMembers,
        acceptInvitation,
        declineInvitation,
        isTeamOwner,
        refreshTeams: fetchTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
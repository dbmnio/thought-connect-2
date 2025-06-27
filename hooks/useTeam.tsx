import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/types/database';

type Team = Database['public']['Tables']['teams']['Row'] & {
  member_count: number;
};

interface TeamContextType {
  selectedTeams: Team[];
  allTeams: Team[];
  loading: boolean;
  toggleTeamSelection: (teamId: string) => void;
  selectAllTeams: () => void;
  selectNoTeams: () => void;
  isTeamSelected: (teamId: string) => boolean;
  createTeam: (name: string, memberEmails: string[]) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          teams (
            id,
            name,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const teamsWithCounts = await Promise.all(
        data.map(async (item) => {
          const team = item.teams as any;
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);

          return {
            ...team,
            member_count: count || 0,
          };
        })
      );

      setAllTeams(teamsWithCounts);
      
      // If no teams are selected, select the personal team by default
      if (selectedTeams.length === 0 && teamsWithCounts.length > 0) {
        const personalTeam = teamsWithCounts.find(t => t.name === 'Personal');
        if (personalTeam) {
          setSelectedTeams([personalTeam]);
        } else {
          setSelectedTeams([teamsWithCounts[0]]);
        }
      } else {
        // Update selected teams with fresh data
        const updatedSelectedTeams = selectedTeams
          .map(selectedTeam => teamsWithCounts.find(t => t.id === selectedTeam.id))
          .filter(Boolean) as Team[];
        setSelectedTeams(updatedSelectedTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    const team = allTeams.find(t => t.id === teamId);
    if (!team) return;

    setSelectedTeams(prev => {
      const isSelected = prev.some(t => t.id === teamId);
      if (isSelected) {
        // Don't allow deselecting all teams
        if (prev.length === 1) return prev;
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
    // Always keep at least one team selected (Personal or first available)
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

  const createTeam = async (name: string, memberEmails: string[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Filter out empty emails and normalize
      const validEmails = memberEmails
        .map(email => email.trim().toLowerCase())
        .filter(email => email && email.includes('@'));

      if (validEmails.length === 0) {
        throw new Error('Please add at least one valid email address');
      }

      // Check if all emails exist in the database
      const emailValidationResults = await Promise.all(
        validEmails.map(async (email) => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('email', email);

          if (error) {
            throw new Error(`Error checking email ${email}: ${error.message}`);
          }

          return {
            email,
            exists: data && data.length > 0,
            profile: data && data.length > 0 ? data[0] : null
          };
        })
      );

      // Find emails that don't exist
      const nonExistentEmails = emailValidationResults
        .filter(result => !result.exists)
        .map(result => result.email);

      if (nonExistentEmails.length > 0) {
        const emailList = nonExistentEmails.join(', ');
        throw new Error(
          `The following email${nonExistentEmails.length > 1 ? 's are' : ' is'} not associated with any user account: ${emailList}. Please ask ${nonExistentEmails.length > 1 ? 'them' : 'the user'} to sign up for the app first before adding ${nonExistentEmails.length > 1 ? 'them' : 'them'} to a team.`
        );
      }

      // Get all valid profile IDs
      const validProfiles = emailValidationResults
        .filter(result => result.exists && result.profile)
        .map(result => result.profile!);

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
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
        });

      if (ownerError) throw ownerError;

      // Add all valid members
      if (validProfiles.length > 0) {
        const memberInserts = validProfiles.map(profile => ({
          team_id: teamData.id,
          user_id: profile.id,
          role: 'member' as const,
        }));

        const { error: memberError } = await supabase
          .from('team_members')
          .insert(memberInserts);

        if (memberError) {
          // If member insertion fails, we should still consider the team created
          console.error('Error adding some team members:', memberError);
          throw new Error(`Team created successfully, but there was an error adding some members: ${memberError.message}`);
        }
      }

      // Refresh teams to show the new team
      await fetchTeams();
      
      // Add the newly created team to selected teams
      const newTeamWithCount = {
        ...teamData,
        member_count: validProfiles.length + 1, // +1 for the owner
      };
      setSelectedTeams(prev => [...prev, newTeamWithCount]);

    } catch (error) {
      throw error;
    }
  };

  return (
    <TeamContext.Provider
      value={{
        selectedTeams,
        allTeams,
        loading,
        toggleTeamSelection,
        selectAllTeams,
        selectNoTeams,
        isTeamSelected,
        createTeam,
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
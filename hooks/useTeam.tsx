import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Database } from '@/types/database';

type Team = Database['public']['Tables']['teams']['Row'] & {
  member_count: number;
};

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  loading: boolean;
  switchTeam: (teamId: string) => void;
  createTeam: (name: string, memberEmails: string[]) => Promise<void>;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
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

      setTeams(teamsWithCounts);
      
      // Set personal team as default if no current team
      if (!currentTeam && teamsWithCounts.length > 0) {
        const personalTeam = teamsWithCounts.find(t => t.name === 'Personal');
        setCurrentTeam(personalTeam || teamsWithCounts[0]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setCurrentTeam(team);
    }
  };

  const createTeam = async (name: string, memberEmails: string[]) => {
    if (!user) throw new Error('User not authenticated');

    try {
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

      // Add other members
      for (const email of memberEmails) {
        if (email.trim()) {
          // Check if user exists - remove .single() to avoid error when no user found
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.trim());

          if (userError) {
            throw new Error(`Error checking user with email ${email}: ${userError.message}`);
          }

          // Check if user was found
          if (!userData || userData.length === 0) {
            throw new Error(`User with email ${email} not found. Please ask them to sign up for the app first before adding them to a team.`);
          }

          // Add as member
          const { error: memberError } = await supabase
            .from('team_members')
            .insert({
              team_id: teamData.id,
              user_id: userData[0].id,
              role: 'member',
            });

          if (memberError) throw memberError;
        }
      }

      await fetchTeams();
    } catch (error) {
      throw error;
    }
  };

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        loading,
        switchTeam,
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
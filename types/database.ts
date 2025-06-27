export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          member_limit: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          member_limit?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          member_limit?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: 'owner' | 'member';
          invitation_status: 'pending' | 'accepted' | 'declined';
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          invitation_status?: 'pending' | 'accepted' | 'declined';
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: 'owner' | 'member';
          invitation_status?: 'pending' | 'accepted' | 'declined';
          joined_at?: string;
        };
      };
      thoughts: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          type: 'question' | 'answer' | 'document';
          title: string;
          description: string;
          image_url: string;
          status: 'open' | 'closed';
          parent_question_id: string | null;
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          type: 'question' | 'answer' | 'document';
          title: string;
          description: string;
          image_url: string;
          status?: 'open' | 'closed';
          parent_question_id?: string | null;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          type?: 'question' | 'answer' | 'document';
          title?: string;
          description?: string;
          image_url?: string;
          status?: 'open' | 'closed';
          parent_question_id?: string | null;
          upvotes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      thought_associations: {
        Row: {
          id: string;
          question_id: string;
          answer_id: string;
          status: 'confirmed' | 'pending' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          answer_id: string;
          status?: 'confirmed' | 'pending' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          answer_id?: string;
          status?: 'confirmed' | 'pending' | 'rejected';
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      child_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          notes: string | null
          parent_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          notes?: string | null
          parent_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          parent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      gig_bookings: {
        Row: {
          client_id: string
          created_at: string | null
          duration_hours: number | null
          event_date: string
          event_type: string
          gig_profile_id: string
          id: string
          location: string | null
          meeting_link: string | null
          special_requests: string | null
          start_time: string
          status: string | null
          total_price: number
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          duration_hours?: number | null
          event_date: string
          event_type: string
          gig_profile_id: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          special_requests?: string | null
          start_time: string
          status?: string | null
          total_price: number
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          duration_hours?: number | null
          event_date?: string
          event_type?: string
          gig_profile_id?: string
          id?: string
          location?: string | null
          meeting_link?: string | null
          special_requests?: string | null
          start_time?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gig_bookings_gig_profile_id_fkey"
            columns: ["gig_profile_id"]
            isOneToOne: false
            referencedRelation: "gig_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_profiles: {
        Row: {
          audio_urls: string[] | null
          base_price: number | null
          bio: string | null
          created_at: string | null
          genres: string[] | null
          id: string
          is_available: boolean | null
          location: string | null
          performer_type: string | null
          price_per_hour: number | null
          rating: number | null
          setlist: string | null
          stage_name: string
          tech_rider: string | null
          total_gigs: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          video_urls: string[] | null
        }
        Insert: {
          audio_urls?: string[] | null
          base_price?: number | null
          bio?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          performer_type?: string | null
          price_per_hour?: number | null
          rating?: number | null
          setlist?: string | null
          stage_name: string
          tech_rider?: string | null
          total_gigs?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          video_urls?: string[] | null
        }
        Update: {
          audio_urls?: string[] | null
          base_price?: number | null
          bio?: string | null
          created_at?: string | null
          genres?: string[] | null
          id?: string
          is_available?: boolean | null
          location?: string | null
          performer_type?: string | null
          price_per_hour?: number | null
          rating?: number | null
          setlist?: string | null
          stage_name?: string
          tech_rider?: string | null
          total_gigs?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          video_urls?: string[] | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          child_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          instrument_id: string
          lesson_type: string | null
          meeting_link: string | null
          notes: string | null
          price: number
          scheduled_at: string
          status: string | null
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instrument_id: string
          lesson_type?: string | null
          meeting_link?: string | null
          notes?: string | null
          price: number
          scheduled_at: string
          status?: string | null
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instrument_id?: string
          lesson_type?: string | null
          meeting_link?: string | null
          notes?: string | null
          price?: number
          scheduled_at?: string
          status?: string | null
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          location: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teacher_instruments: {
        Row: {
          created_at: string
          id: string
          instrument_id: string
          proficiency_level: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instrument_id: string
          proficiency_level?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instrument_id?: string
          proficiency_level?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_instruments_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_instruments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          availability: string | null
          created_at: string
          experience_years: number | null
          hourly_rate: number
          id: string
          is_in_person_available: boolean | null
          is_online_available: boolean | null
          rating: number | null
          teaching_style: string | null
          total_lessons: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number
          id?: string
          is_in_person_available?: boolean | null
          is_online_available?: boolean | null
          rating?: number | null
          teaching_style?: string | null
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number
          id?: string
          is_in_person_available?: boolean | null
          is_online_available?: boolean | null
          rating?: number | null
          teaching_style?: string | null
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_teacher_user_id: {
        Args: { _teacher_profile_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher", "parent"],
    },
  },
} as const

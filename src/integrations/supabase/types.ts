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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      llm_function_calls: {
        Row: {
          created_at: string
          function_arguments: Json | null
          function_name: string
          function_response: Json | null
          id: string
          trace_id: string
        }
        Insert: {
          created_at?: string
          function_arguments?: Json | null
          function_name: string
          function_response?: Json | null
          id?: string
          trace_id: string
        }
        Update: {
          created_at?: string
          function_arguments?: Json | null
          function_name?: string
          function_response?: Json | null
          id?: string
          trace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_function_calls_trace_id_fkey"
            columns: ["trace_id"]
            isOneToOne: false
            referencedRelation: "llm_traces"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_traces: {
        Row: {
          assistant_response: string | null
          created_at: string
          data_source: Database["public"]["Enums"]["data_source_type"] | null
          editable_output: string | null
          id: string
          llm_score: string
          reject_reason: string | null
          scenario: Database["public"]["Enums"]["scenario_type"] | null
          status: Database["public"]["Enums"]["eval_status_type"]
          tool: Database["public"]["Enums"]["tool_type"] | null
          updated_at: string
          user_message: string
        }
        Insert: {
          assistant_response?: string | null
          created_at?: string
          data_source?: Database["public"]["Enums"]["data_source_type"] | null
          editable_output?: string | null
          id?: string
          llm_score: string
          reject_reason?: string | null
          scenario?: Database["public"]["Enums"]["scenario_type"] | null
          status?: Database["public"]["Enums"]["eval_status_type"]
          tool?: Database["public"]["Enums"]["tool_type"] | null
          updated_at?: string
          user_message: string
        }
        Update: {
          assistant_response?: string | null
          created_at?: string
          data_source?: Database["public"]["Enums"]["data_source_type"] | null
          editable_output?: string | null
          id?: string
          llm_score?: string
          reject_reason?: string | null
          scenario?: Database["public"]["Enums"]["scenario_type"] | null
          status?: Database["public"]["Enums"]["eval_status_type"]
          tool?: Database["public"]["Enums"]["tool_type"] | null
          updated_at?: string
          user_message?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_daily_stats_filtered: {
        Args: {
          days_limit?: number
          filter_data_source?: Database["public"]["Enums"]["data_source_type"]
          filter_scenario?: Database["public"]["Enums"]["scenario_type"]
          filter_status?: Database["public"]["Enums"]["eval_status_type"]
          filter_tool?: Database["public"]["Enums"]["tool_type"]
        }
        Returns: {
          acceptance_rate: number
          agreement_rate: number
          date: string
        }[]
      }
    }
    Enums: {
      data_source_type: "API" | "Upload" | "Manual" | "Other"
      eval_status_type: "Pending" | "Accepted" | "Rejected"
      scenario_type:
        | "Code Generation"
        | "Text Generation"
        | "Data Analysis"
        | "Creative Writing"
        | "Other"
      tool_type: "ChatGPT" | "Claude" | "Gemini" | "Other"
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
      data_source_type: ["API", "Upload", "Manual", "Other"],
      eval_status_type: ["Pending", "Accepted", "Rejected"],
      scenario_type: [
        "Code Generation",
        "Text Generation",
        "Data Analysis",
        "Creative Writing",
        "Other",
      ],
      tool_type: ["ChatGPT", "Claude", "Gemini", "Other"],
    },
  },
} as const

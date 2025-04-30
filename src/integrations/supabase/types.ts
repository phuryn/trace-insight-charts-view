export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      llm_function_calls: {
        Row: {
          created_at: string
          function_arguments: Json
          function_name: string
          function_response: Json | null
          id: string
          trace_id: string
        }
        Insert: {
          created_at?: string
          function_arguments: Json
          function_name: string
          function_response?: Json | null
          id?: string
          trace_id: string
        }
        Update: {
          created_at?: string
          function_arguments?: Json
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
          assistant_response: string
          created_at: string
          data_source: Database["public"]["Enums"]["data_source_type"]
          editable_output: string
          id: string
          llm_score: Database["public"]["Enums"]["llm_score_type"]
          reject_reason: string | null
          scenario: Database["public"]["Enums"]["scenario_type"]
          status: Database["public"]["Enums"]["eval_status_type"]
          tool: Database["public"]["Enums"]["tool_type"]
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string
          data_source: Database["public"]["Enums"]["data_source_type"]
          editable_output: string
          id?: string
          llm_score: Database["public"]["Enums"]["llm_score_type"]
          reject_reason?: string | null
          scenario: Database["public"]["Enums"]["scenario_type"]
          status?: Database["public"]["Enums"]["eval_status_type"]
          tool: Database["public"]["Enums"]["tool_type"]
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string
          data_source?: Database["public"]["Enums"]["data_source_type"]
          editable_output?: string
          id?: string
          llm_score?: Database["public"]["Enums"]["llm_score_type"]
          reject_reason?: string | null
          scenario?: Database["public"]["Enums"]["scenario_type"]
          status?: Database["public"]["Enums"]["eval_status_type"]
          tool?: Database["public"]["Enums"]["tool_type"]
          user_message?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_stats: {
        Args: { days_limit?: number }
        Returns: {
          date: string
          agreement_rate: number
          acceptance_rate: number
        }[]
      }
      get_daily_stats_filtered: {
        Args: {
          days_limit?: number
          filter_tool?: string
          filter_scenario?: string
          filter_status?: string
          filter_data_source?: string
        }
        Returns: {
          date: string
          agreement_rate: number
          acceptance_rate: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      data_source_type: "Human" | "Synthetic" | "All"
      eval_status_type: "Pending" | "Accepted" | "Rejected"
      llm_score_type: "Pass" | "Fail"
      scenario_type:
        | "Multiple-Listings"
        | "Offer-Submission"
        | "Property-Analysis"
        | "Client-Communication"
        | "Market-Research"
        | "Closing-Process"
      tool_type:
        | "Listing-Finder"
        | "Email-Draft"
        | "Market-Analysis"
        | "Offer-Generator"
        | "Valuation-Tool"
        | "Appointment-Scheduler"
      user_role: "Inspector" | "Reviewer" | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      data_source_type: ["Human", "Synthetic", "All"],
      eval_status_type: ["Pending", "Accepted", "Rejected"],
      llm_score_type: ["Pass", "Fail"],
      scenario_type: [
        "Multiple-Listings",
        "Offer-Submission",
        "Property-Analysis",
        "Client-Communication",
        "Market-Research",
        "Closing-Process",
      ],
      tool_type: [
        "Listing-Finder",
        "Email-Draft",
        "Market-Analysis",
        "Offer-Generator",
        "Valuation-Tool",
        "Appointment-Scheduler",
      ],
      user_role: ["Inspector", "Reviewer", "Admin"],
    },
  },
} as const

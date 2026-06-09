export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          feature_flags: Json;
          funded_states: string[];
          id: number;
          rate_settings: Json;
          state_eligibility: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          feature_flags?: Json;
          funded_states?: string[];
          id?: number;
          rate_settings?: Json;
          state_eligibility?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          feature_flags?: Json;
          funded_states?: string[];
          id?: number;
          rate_settings?: Json;
          state_eligibility?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      logic_documents: {
        Row: {
          created_at: string;
          file_path: string | null;
          id: string;
          parsed_rules: Json | null;
          sanitized_content: string | null;
          source_type: string;
          title: string;
          updated_at: string;
          version: string;
        };
        Insert: {
          created_at?: string;
          file_path?: string | null;
          id?: string;
          parsed_rules?: Json | null;
          sanitized_content?: string | null;
          source_type: string;
          title: string;
          updated_at?: string;
          version?: string;
        };
        Update: {
          created_at?: string;
          file_path?: string | null;
          id?: string;
          parsed_rules?: Json | null;
          sanitized_content?: string | null;
          source_type?: string;
          title?: string;
          updated_at?: string;
          version?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          address: string;
          borrower_type: string | null;
          created_at: string;
          fico: number | null;
          id: string;
          loan_officer_id: string | null;
          prequal_consent_at: string | null;
          prequal_consent_ip: string | null;
          property_intel: Json | null;
          purpose: string | null;
          session_id: string;
          status: string;
          term_sheet: Json | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          address: string;
          borrower_type?: string | null;
          created_at?: string;
          fico?: number | null;
          id?: string;
          loan_officer_id?: string | null;
          prequal_consent_at?: string | null;
          prequal_consent_ip?: string | null;
          property_intel?: Json | null;
          purpose?: string | null;
          session_id: string;
          status?: string;
          term_sheet?: Json | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string;
          borrower_type?: string | null;
          created_at?: string;
          fico?: number | null;
          id?: string;
          loan_officer_id?: string | null;
          prequal_consent_at?: string | null;
          prequal_consent_ip?: string | null;
          property_intel?: Json | null;
          purpose?: string | null;
          session_id?: string;
          status?: string;
          term_sheet?: Json | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      knowledge_documents: {
        Row: {
          content: string | null;
          created_at: string;
          created_by: string | null;
          file_path: string | null;
          id: string;
          source_type: string;
          source_url: string | null;
          supermemory_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_path?: string | null;
          id?: string;
          source_type: string;
          source_url?: string | null;
          supermemory_id?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          created_by?: string | null;
          file_path?: string | null;
          id?: string;
          source_type?: string;
          source_url?: string | null;
          supermemory_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_inquiries: {
        Row: {
          borrower_type: Database["public"]["Enums"]["borrower_type"];
          city: string | null;
          country: string;
          county: string | null;
          created_at: string;
          down_payment_pct: number | null;
          fico_band: string;
          id: string;
          intended_horizon: Database["public"]["Enums"]["investment_horizon"];
          loan_strategy: Database["public"]["Enums"]["loan_strategy"];
          realie_error: string | null;
          realie_property: Json | null;
          state: string;
          status: string;
          street_address: string;
          unit_number: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          borrower_type: Database["public"]["Enums"]["borrower_type"];
          city?: string | null;
          country?: string;
          county?: string | null;
          created_at?: string;
          down_payment_pct?: number | null;
          fico_band: string;
          id?: string;
          intended_horizon: Database["public"]["Enums"]["investment_horizon"];
          loan_strategy: Database["public"]["Enums"]["loan_strategy"];
          realie_error?: string | null;
          realie_property?: Json | null;
          state: string;
          status?: string;
          street_address: string;
          unit_number?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          borrower_type?: Database["public"]["Enums"]["borrower_type"];
          city?: string | null;
          country?: string;
          county?: string | null;
          created_at?: string;
          down_payment_pct?: number | null;
          fico_band?: string;
          id?: string;
          intended_horizon?: Database["public"]["Enums"]["investment_horizon"];
          loan_strategy?: Database["public"]["Enums"]["loan_strategy"];
          realie_error?: string | null;
          realie_property?: Json | null;
          state?: string;
          status?: string;
          street_address?: string;
          unit_number?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          is_secret: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          is_secret?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          is_secret?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      loan_officers: {
        Row: {
          active: boolean;
          avatar_initials: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          avatar_initials?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          name: string;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          avatar_initials?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin_or_superadmin: { Args: Record<string, never>; Returns: boolean };
      is_superadmin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      borrower_type: "us_citizen" | "us_resident" | "foreign_national";
      investment_horizon: "long_term" | "short_term" | "mid_term";
      loan_strategy:
        | "purchase"
        | "refi_rate_term"
        | "cash_out"
        | "bridge_to_dscr";
      user_role: "user" | "admin" | "superadmin";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type LoanStrategy = Database["public"]["Enums"]["loan_strategy"];
export type BorrowerType = Database["public"]["Enums"]["borrower_type"];
export type InvestmentHorizon =
  Database["public"]["Enums"]["investment_horizon"];
export type UserRole = Database["public"]["Enums"]["user_role"];

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
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      borrower_type: "us_citizen" | "us_resident" | "foreign_national";
      investment_horizon: "long_term" | "short_term" | "mid_term";
      loan_strategy:
        | "purchase"
        | "refi_rate_term"
        | "cash_out"
        | "bridge_to_dscr";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type LoanStrategy = Database["public"]["Enums"]["loan_strategy"];
export type BorrowerType = Database["public"]["Enums"]["borrower_type"];
export type InvestmentHorizon =
  Database["public"]["Enums"]["investment_horizon"];

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your schema
export type Database = {
  public: {
    Tables: {
      family_members: {
        Row: {
          id: string;
          full_name: string;
          nickname: string;
          profile_photo: string | null;
          relationship: string;
          date_of_birth: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          nickname: string;
          profile_photo?: string | null;
          relationship: string;
          date_of_birth?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          nickname?: string;
          profile_photo?: string | null;
          relationship?: string;
          date_of_birth?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      buildings: {
        Row: {
          id: string;
          name: string;
          building_code: string;
          address: string;
          description: string | null;
          total_floors: number;
          total_apartments: number;
          amenities: string[] | null;
          construction_year: number | null;
          images: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          building_code: string;
          address: string;
          description?: string | null;
          total_floors: number;
          total_apartments: number;
          amenities?: string[] | null;
          construction_year?: number | null;
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          building_code?: string;
          address?: string;
          description?: string | null;
          total_floors?: number;
          total_apartments?: number;
          amenities?: string[] | null;
          construction_year?: number | null;
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other table types as needed...
    };
  };
};

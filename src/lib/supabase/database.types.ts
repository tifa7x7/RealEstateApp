/**
 * Hand-written types matching supabase/migrations/0001_init.sql.
 * Regenerate from Supabase via `npx supabase gen types typescript` once the
 * project is provisioned and prefer the generated output over this file.
 */
import type {
  CalcObject,
  DataConfidence,
  Locale,
  ProjectClass,
  ProjectStatus,
  UnitStatus,
  UserTier,
} from '@/lib/types';

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
      projects: {
        Row: {
          id: number;
          name: string;
          developer: string;
          city: string;
          district: string;
          status: ProjectStatus;
          class_type: ProjectClass;
          building_type: string;
          buildings: number;
          total_units: number;
          size_min: number;
          size_max: number;
          floors: number;
          price_per_sqm: number;
          min_price: number;
          completion: string;
          amenities: string[];
          dist_sea: number;
          lat: number;
          lng: number;
          date_added: string | null;
          data_confidence: DataConfidence | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: number;
          name: string;
          developer: string;
          city: string;
          district: string;
          status: ProjectStatus;
          class_type: ProjectClass;
          building_type: string;
          buildings: number;
          total_units: number;
          size_min: number;
          size_max: number;
          floors: number;
          price_per_sqm: number;
          min_price: number;
          completion: string;
          amenities?: string[];
          dist_sea: number;
          lat: number;
          lng: number;
          date_added?: string | null;
          data_confidence?: DataConfidence | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [];
      };
      units: {
        Row: {
          project_id: number;
          id: string;
          building: string;
          floor: number;
          rooms: number;
          area: number;
          price: number;
          status: UnitStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: number;
          id: string;
          building: string;
          floor: number;
          rooms: number;
          area: number;
          price: number;
          status: UnitStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['units']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'units_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          user_name: string;
          tier: UserTier;
          locale: Locale;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_name?: string;
          tier?: UserTier;
          locale?: Locale;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      lists: {
        Row: {
          id: string;
          owner_user_id: string;
          name: string;
          visibility: 'private' | 'unlisted' | 'public';
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id: string;
          name: string;
          visibility?: 'private' | 'unlisted' | 'public';
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lists']['Insert']>;
        Relationships: [];
      };
      list_items: {
        Row: {
          list_id: string;
          project_id: number;
          unit_id: string | null;
          position: number;
          note: string | null;
          added_at: string;
        };
        Insert: {
          list_id: string;
          project_id: number;
          unit_id?: string | null;
          position?: number;
          note?: string | null;
          added_at?: string;
        };
        Update: Partial<Database['public']['Tables']['list_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'list_items_list_id_fkey';
            columns: ['list_id'];
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_items_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'list_items_project_id_unit_id_fkey';
            columns: ['project_id', 'unit_id'];
            referencedRelation: 'units';
            referencedColumns: ['project_id', 'id'];
          },
        ];
      };
      list_followers: {
        Row: {
          list_id: string;
          follower_user_id: string;
          alerts_enabled: boolean;
          created_at: string;
        };
        Insert: {
          list_id: string;
          follower_user_id: string;
          alerts_enabled?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['list_followers']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'list_followers_list_id_fkey';
            columns: ['list_id'];
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      list_collaborators: {
        Row: {
          list_id: string;
          user_id: string;
          role: 'editor' | 'viewer';
          created_at: string;
        };
        Insert: {
          list_id: string;
          user_id: string;
          role: 'editor' | 'viewer';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['list_collaborators']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'list_collaborators_list_id_fkey';
            columns: ['list_id'];
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      list_comments: {
        Row: {
          id: string;
          list_id: string;
          author_user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          author_user_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['list_comments']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'list_comments_list_id_fkey';
            columns: ['list_id'];
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_calculations: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          objects: CalcObject[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          objects: CalcObject[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['saved_calculations']['Insert']
        >;
        Relationships: [];
      };
      rental_properties: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          type: string | null;
          purchase_price: number | null;
          current_value: number | null;
          monthly_rent: number | null;
          monthly_expenses: number | null;
          purchase_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          type?: string | null;
          purchase_price?: number | null;
          current_value?: number | null;
          monthly_rent?: number | null;
          monthly_expenses?: number | null;
          purchase_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['rental_properties']['Insert']
        >;
        Relationships: [];
      };
      price_snapshots: {
        Row: {
          project_id: number;
          unit_id: string;
          captured_at: string;
          price: number;
        };
        Insert: {
          project_id: number;
          unit_id: string;
          captured_at?: string;
          price: number;
        };
        Update: Partial<Database['public']['Tables']['price_snapshots']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'price_snapshots_project_id_unit_id_fkey';
            columns: ['project_id', 'unit_id'];
            referencedRelation: 'units';
            referencedColumns: ['project_id', 'id'];
          },
        ];
      };
      price_alerts: {
        Row: {
          id: string;
          user_id: string;
          list_id: string;
          threshold_pct: number;
          channel: 'email';
          active: boolean;
          last_notified_at: string | null;
          unsubscribe_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          list_id: string;
          threshold_pct?: number;
          channel?: 'email';
          active?: boolean;
          last_notified_at?: string | null;
          unsubscribe_token?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['price_alerts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'price_alerts_list_id_fkey';
            columns: ['list_id'];
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      /** Full-text search RPC. See supabase/migrations/0002_fts.sql. */
      search_projects: {
        Args: { query: string };
        Returns: Database['public']['Tables']['projects']['Row'][];
      };
      /** Phase 16 — snapshot today's price for every watched unit. */
      capture_price_snapshots: {
        Args: Record<string, never>;
        Returns: number;
      };
      /** Phase 17 — list-scoped: pending alert rows whose latest snapshot crossed threshold. */
      compute_pending_alerts: {
        Args: Record<string, never>;
        Returns: {
          alert_id: string;
          user_id: string;
          list_id: string;
          project_id: number;
          unit_id: string | null;
          previous_price: number;
          current_price: number;
          delta_pct: number;
          threshold_pct: number;
          last_notified_at: string | null;
          unsubscribe_token: string;
        }[];
      };
      /** Phase 16 — stamp last_notified_at on the given alerts. */
      mark_alerts_notified: {
        Args: { alert_ids: string[] };
        Returns: void;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

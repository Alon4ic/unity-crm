// Need to install the following packages:
// supabase@2.33.7
// Ok to proceed? (y) 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          email: string | null
          id: number
          name: string
          phone: string | null
          type: string
        }
        Insert: {
          address?: string | null
          email?: string | null
          id?: never
          name: string
          phone?: string | null
          type?: string
        }
        Update: {
          address?: string | null
          email?: string | null
          id?: never
          name?: string
          phone?: string | null
          type?: string
        }
        Relationships: []
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          role: string | null
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          role?: string | null
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          role?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
      load_transactions: {
        Row: {
          created_at: string
          id: string
          load: number
          markup: number | null
          price: number
          price_with_markup: number
          product_id: string
          return_qty: number
          sale_page_id: string
          sales_sum: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          load?: number
          markup?: number | null
          price?: number
          price_with_markup?: number
          product_id: string
          return_qty?: number
          sale_page_id: string
          sales_sum?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          load?: number
          markup?: number | null
          price?: number
          price_with_markup?: number
          product_id?: string
          return_qty?: number
          sale_page_id?: string
          sales_sum?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "load_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_transactions_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "manager_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vw_session_sales"
            referencedColumns: ["session_id"]
          },
        ]
      }
      manager_sessions: {
        Row: {
          duration_days: number | null
          ended_at: string | null
          id: string
          sale_page_id: string
          started_at: string
          total_loaded: number | null
          total_return: number | null
          total_sales_sum: number | null
        }
        Insert: {
          duration_days?: number | null
          ended_at?: string | null
          id?: string
          sale_page_id: string
          started_at?: string
          total_loaded?: number | null
          total_return?: number | null
          total_sales_sum?: number | null
        }
        Update: {
          duration_days?: number | null
          ended_at?: string | null
          id?: string
          sale_page_id?: string
          started_at?: string
          total_loaded?: number | null
          total_return?: number | null
          total_sales_sum?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_sessions_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      markup_rates: {
        Row: {
          id: number
          is_default: boolean | null
          name: string
          value: number
        }
        Insert: {
          id?: number
          is_default?: boolean | null
          name: string
          value: number
        }
        Update: {
          id?: number
          is_default?: boolean | null
          name?: string
          value?: number
        }
        Relationships: []
      }
      product_events: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metadata: {
        Row: {
          field_name: string
          field_type: string
          id: number
          product_id: number | null
        }
        Insert: {
          field_name: string
          field_type: string
          id?: number
          product_id?: number | null
        }
        Update: {
          field_name?: string
          field_type?: string
          id?: number
          product_id?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          background_color: string | null
          category_id: string | null
          code: string | null
          created_at: string | null
          id: string
          initial_quantity: number | null
          markup_percent: number | null
          name: string
          price: number
          quantity: number
          sort_order: number | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          initial_quantity?: number | null
          markup_percent?: number | null
          name: string
          price: number
          quantity: number
          sort_order?: number | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          category_id?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          initial_quantity?: number | null
          markup_percent?: number | null
          name?: string
          price?: number
          quantity?: number
          sort_order?: number | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          date: string
          id: number
          is_return: boolean | null
          price: number
          product_id: number
          quantity: number
          supplier_id: number
        }
        Insert: {
          date: string
          id?: number
          is_return?: boolean | null
          price: number
          product_id: number
          quantity: number
          supplier_id: number
        }
        Update: {
          date?: string
          id?: number
          is_return?: boolean | null
          price?: number
          product_id?: number
          quantity?: number
          supplier_id?: number
        }
        Relationships: []
      }
      return_buffer: {
        Row: {
          id: string
          inserted_at: string | null
          product_id: string | null
          quantity: number
          sale_page_id: string | null
        }
        Insert: {
          id?: string
          inserted_at?: string | null
          product_id?: string | null
          quantity: number
          sale_page_id?: string | null
        }
        Update: {
          id?: string
          inserted_at?: string | null
          product_id?: string | null
          quantity?: number
          sale_page_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_buffer_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_buffer_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_loads: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          qty: number
          sale_id: string | null
          sale_page_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          qty: number
          sale_id?: string | null
          sale_page_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          qty?: number
          sale_id?: string | null
          sale_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_loads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_loads_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_pages: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean | null
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean | null
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string | null
          created_date: string | null
          id: string
          load: number | null
          product_id: string
          return_qty: number | null
          sale_page_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          created_date?: string | null
          id?: string
          load?: number | null
          product_id: string
          return_qty?: number | null
          sale_page_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          created_date?: string | null
          id?: string
          load?: number | null
          product_id?: string
          return_qty?: number | null
          sale_page_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_events: {
        Row: {
          event_time: string
          event_type: string
          id: string
          markup: number
          price: number
          product_id: string
          qty: number
          sale_page_id: string
          session_id: string | null
        }
        Insert: {
          event_time?: string
          event_type: string
          id?: string
          markup: number
          price: number
          product_id: string
          qty: number
          sale_page_id: string
          session_id?: string | null
        }
        Update: {
          event_time?: string
          event_type?: string
          id?: string
          markup?: number
          price?: number
          product_id?: string
          qty?: number
          sale_page_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_events_sale_page_id_fkey"
            columns: ["sale_page_id"]
            isOneToOne: false
            referencedRelation: "sale_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "manager_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "vw_session_sales"
            referencedColumns: ["session_id"]
          },
        ]
      }
      sync_queue: {
        Row: {
          created_at: string
          data: Json
          id: number
          operation: string
          table_name: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: number
          operation: string
          table_name: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
          operation?: string
          table_name?: string
        }
        Relationships: []
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          id: number
          is_default: boolean | null
          name: string
          value: number
        }
        Insert: {
          id?: number
          is_default?: boolean | null
          name: string
          value: number
        }
        Update: {
          id?: number
          is_default?: boolean | null
          name?: string
          value?: number
        }
        Relationships: []
      }
      translations: {
        Row: {
          id: number
          key: string
          lang: string
          value: string
        }
        Insert: {
          id?: never
          key: string
          lang: string
          value: string
        }
        Update: {
          id?: never
          key?: string
          lang?: string
          value?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          code: string
          id: number
          is_weight: boolean | null
        }
        Insert: {
          code: string
          id?: number
          is_weight?: boolean | null
        }
        Update: {
          code?: string
          id?: number
          is_weight?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_session_sales: {
        Row: {
          code: string | null
          name: string | null
          price_with_markup: number | null
          product_id: string | null
          session_id: string | null
          total_load: number | null
          total_return: number | null
        }
        Relationships: [
          {
            foreignKeyName: "load_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

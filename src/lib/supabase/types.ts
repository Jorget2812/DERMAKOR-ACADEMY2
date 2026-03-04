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
      admin_users: {
        Row: {
          created_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_settings: {
        Row: {
          account_holder: string
          bank_name: string
          created_at: string
          iban: string
          id: string
          instructions: string | null
          is_active: boolean | null
          qr_code_url: string | null
          swift_bic: string
          updated_at: string
        }
        Insert: {
          account_holder: string
          bank_name: string
          created_at?: string
          iban: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          qr_code_url?: string | null
          swift_bic: string
          updated_at?: string
        }
        Update: {
          account_holder?: string
          bank_name?: string
          created_at?: string
          iban?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          qr_code_url?: string | null
          swift_bic?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          payload: Json | null
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      category_discounts: {
        Row: {
          category_id: string | null
          id: string
          level: Database["public"]["Enums"]["user_level"]
          percent: number
          year_month: string
        }
        Insert: {
          category_id?: string | null
          id?: string
          level: Database["public"]["Enums"]["user_level"]
          percent: number
          year_month: string
        }
        Update: {
          category_id?: string | null
          id?: string
          level?: Database["public"]["Enums"]["user_level"]
          percent?: number
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_discounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          slug: string
          thumbnail_url: string | null
          title: string
          visibility: Database["public"]["Enums"]["content_visibility"] | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          slug: string
          thumbnail_url?: string | null
          title: string
          visibility?: Database["public"]["Enums"]["content_visibility"] | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          slug?: string
          thumbnail_url?: string | null
          title?: string
          visibility?: Database["public"]["Enums"]["content_visibility"] | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          last_position_sec: number | null
          lesson_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          last_position_sec?: number | null
          lesson_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          last_position_sec?: number | null
          lesson_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          id: string
          module_id: string | null
          pdf_path: string | null
          position: number
          title: string
          video_url: string | null
          visibility: Database["public"]["Enums"]["content_visibility"] | null
        }
        Insert: {
          content?: string | null
          id?: string
          module_id?: string | null
          pdf_path?: string | null
          position: number
          title: string
          video_url?: string | null
          visibility?: Database["public"]["Enums"]["content_visibility"] | null
        }
        Update: {
          content?: string | null
          id?: string
          module_id?: string | null
          pdf_path?: string | null
          position?: number
          title?: string
          video_url?: string | null
          visibility?: Database["public"]["Enums"]["content_visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string | null
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id?: string | null
          id?: string
          position: number
          title: string
        }
        Update: {
          course_id?: string | null
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_discounts: {
        Row: {
          id: string
          level: Database["public"]["Enums"]["user_level"]
          percent: number
          year_month: string
        }
        Insert: {
          id?: string
          level: Database["public"]["Enums"]["user_level"]
          percent: number
          year_month: string
        }
        Update: {
          id?: string
          level?: Database["public"]["Enums"]["user_level"]
          percent?: number
          year_month?: string
        }
        Relationships: []
      }
      product_badges: {
        Row: {
          id: string
          product_id: string
          level: Database["public"]["Enums"]["user_level"]
          locale: string
          badge_text: string
          enabled: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          level: Database["public"]["Enums"]["user_level"]
          locale: string
          badge_text: string
          enabled?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          level?: Database["public"]["Enums"]["user_level"]
          locale?: string
          badge_text?: string
          enabled?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_badges_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      dashboard_settings: {
        Row: {
          id: string
          level: Database["public"]["Enums"]["user_level"]
          locale: string
          enabled: boolean
          hero_title: string | null
          hero_body: string | null
          hero_cta_label: string | null
          hero_cta_href: string | null
          card1_title: string | null
          card1_body: string | null
          card1_icon: string | null
          card1_cta_label: string | null
          card1_cta_href: string | null
          card2_title: string | null
          card2_body: string | null
          card2_icon: string | null
          card2_cta_label: string | null
          card2_cta_href: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          level: Database["public"]["Enums"]["user_level"]
          locale: string
          enabled?: boolean
          hero_title?: string | null
          hero_body?: string | null
          hero_cta_label?: string | null
          hero_cta_href?: string | null
          card1_title?: string | null
          card1_body?: string | null
          card1_icon?: string | null
          card1_cta_label?: string | null
          card1_cta_href?: string | null
          card2_title?: string | null
          card2_body?: string | null
          card2_icon?: string | null
          card2_cta_label?: string | null
          card2_cta_href?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          level?: Database["public"]["Enums"]["user_level"]
          locale?: string
          enabled?: boolean
          hero_title?: string | null
          hero_body?: string | null
          hero_cta_label?: string | null
          hero_cta_href?: string | null
          card1_title?: string | null
          card1_body?: string | null
          card1_icon?: string | null
          card1_cta_label?: string | null
          card1_cta_href?: string | null
          card2_title?: string | null
          card2_body?: string | null
          card2_icon?: string | null
          card2_cta_label?: string | null
          card2_cta_href?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          base_unit_price_cents: number
          discount_percent: number
          gross_unit_price_cents: number
          id: string
          line_total_cents: number
          net_unit_price_cents: number
          order_id: string | null
          qty: number
          variant_id: string | null
          vat_amount_cents: number
          vat_rate: number
          retail_unit_price_cents: number | null
          resale_factor_used: number | null
        }
        Insert: {
          base_unit_price_cents: number
          discount_percent: number
          gross_unit_price_cents: number
          id?: string
          line_total_cents: number
          net_unit_price_cents: number
          order_id?: string | null
          qty: number
          variant_id?: string | null
          vat_amount_cents: number
          vat_rate: number
          retail_unit_price_cents?: number | null
          resale_factor_used?: number | null
        }
        Update: {
          base_unit_price_cents?: number
          discount_percent?: number
          gross_unit_price_cents?: number
          id?: string
          line_total_cents?: number
          net_unit_price_cents?: number
          order_id?: string | null
          qty?: number
          variant_id?: string | null
          vat_amount_cents?: number
          vat_rate?: number
          retail_unit_price_cents?: number | null
          resale_factor_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          currency: string
          id: string
          shipping_address: Json
          shipping_cost_cents: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          stripe_session_id: string | null
          invoice_number: string | null
          invoice_pdf_path: string | null
          total_base_cents: number
          total_discount_cents: number
          total_final_cents: number
          user_id: string
          vat_total_cents: number
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          shipping_address: Json
          shipping_cost_cents?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_session_id?: string | null
          invoice_number?: string | null
          invoice_pdf_path?: string | null
          total_base_cents: number
          total_discount_cents: number
          total_final_cents: number
          user_id: string
          vat_total_cents?: number
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string
          id?: string
          shipping_address?: Json
          shipping_cost_cents?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stripe_session_id?: string | null
          invoice_number?: string | null
          invoice_pdf_path?: string | null
          total_base_cents?: number
          total_discount_cents?: number
          total_final_cents?: number
          user_id?: string
          vat_total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean | null
          attributes: Json | null
          base_price_cents: number
          id: string
          product_id: string | null
          sku: string
          stock_count: number
          compare_at_price_cents: number | null
          cost_per_item_cents: number | null
          charge_tax: boolean | null
          barcode: string | null
          continue_selling_out_of_stock: boolean | null
          weight: number | null
          hs_code: string | null
          origin_country: string | null
        }
        Insert: {
          active?: boolean | null
          attributes?: Json | null
          base_price_cents: number
          id?: string
          product_id?: string | null
          sku: string
          stock_count?: number
          compare_at_price_cents?: number | null
          cost_per_item_cents?: number | null
          charge_tax?: boolean | null
          barcode?: string | null
          continue_selling_out_of_stock?: boolean | null
          weight?: number | null
          hs_code?: string | null
          origin_country?: string | null
        }
        Update: {
          active?: boolean | null
          attributes?: Json | null
          base_price_cents?: number
          id?: string
          product_id?: string | null
          sku?: string
          stock_count?: number
          compare_at_price_cents?: number | null
          cost_per_item_cents?: number | null
          charge_tax?: boolean | null
          barcode?: string | null
          continue_selling_out_of_stock?: boolean | null
          weight?: number | null
          hs_code?: string | null
          origin_country?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          images: string[] | null
          type: string | null
          vendor: string | null
          tags: string[] | null
          custom_metadata: Json | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          images?: string[] | null
          type?: string | null
          vendor?: string | null
          tags?: string[] | null
          custom_metadata?: Json | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          images?: string[] | null
          type?: string | null
          vendor?: string | null
          tags?: string[] | null
          custom_metadata?: Json | null
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
      pricing_pro_rules: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["user_level"]
          product_id: string | null
          resale_factor: number
          scope: Database["public"]["Enums"]["pricing_scope"]
          year_month: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["user_level"]
          product_id?: string | null
          resale_factor: number
          scope: Database["public"]["Enums"]["pricing_scope"]
          year_month: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["user_level"]
          product_id?: string | null
          resale_factor?: number
          scope?: Database["public"]["Enums"]["pricing_scope"]
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_pro_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_pro_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_pro: string | null
          company_name: string | null
          created_at: string | null
          email: string
          expertise_domain: string | null
          full_name: string
          id: string
          ide_situation: string | null
          level: Database["public"]["Enums"]["user_level"] | null
          locale: string | null
          phone_personal: string | null
          phone_pro: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          verification_status:
          | Database["public"]["Enums"]["verification_status"]
          | null
          website: string | null
        }
        Insert: {
          address_pro?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          expertise_domain?: string | null
          full_name: string
          id: string
          ide_situation?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          locale?: string | null
          phone_personal?: string | null
          phone_pro?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          verification_status?:
          | Database["public"]["Enums"]["verification_status"]
          | null
          website?: string | null
        }
        Update: {
          address_pro?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          expertise_domain?: string | null
          full_name?: string
          id?: string
          ide_situation?: string | null
          level?: Database["public"]["Enums"]["user_level"] | null
          locale?: string | null
          phone_personal?: string | null
          phone_pro?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          verification_status?:
          | Database["public"]["Enums"]["verification_status"]
          | null
          website?: string | null
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          event_id: string
          processed_at: string | null
        }
        Insert: {
          event_id: string
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          address_pro: string
          admin_notes: string | null
          canton: string | null
          company_name: string
          created_at: string | null
          email: string
          expertise_domain: string
          full_name: string
          id: string
          ide_number: string | null
          ide_situation: string
          message: string | null
          phone_personal: string | null
          phone_pro: string
          professional_type: string | null
          request_object: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          website: string | null
        }
        Insert: {
          address_pro: string
          admin_notes?: string | null
          canton?: string | null
          company_name: string
          created_at?: string | null
          email: string
          expertise_domain: string
          full_name: string
          id?: string
          ide_number?: string | null
          ide_situation: string
          message?: string | null
          phone_personal?: string | null
          phone_pro: string
          professional_type?: string | null
          request_object?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          website?: string | null
        }
        Update: {
          address_pro?: string
          admin_notes?: string | null
          canton?: string | null
          company_name?: string
          created_at?: string | null
          email?: string
          expertise_domain?: string
          full_name?: string
          id?: string
          ide_number?: string | null
          ide_situation?: string
          message?: string | null
          phone_personal?: string | null
          phone_pro?: string
          professional_type?: string | null
          request_object?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          website?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock_safe: {
        Args: { p_qty: number; p_variant_id: string }
        Returns: boolean
      }
      get_product_public: {
        Args: { p_slug: string }
        Returns: {
          category_id: string
          description: string
          id: string
          name: string
          slug: string
          variants: Json
        }[]
      }
      get_products_with_pricing: {
        Args: never
        Returns: {
          base_price_cents: number
          discount_percent: number
          gross_price_cents: number
          name: string
          net_price_cents: number
          product_id: string
          sku: string
          stock_count: number
          variant_id: string
          vat_amount_cents: number
          vat_rate: number
        }[]
      }
      is_admin: { Args: { p_uid?: string }; Returns: boolean }
      list_products_public: {
        Args: never
        Returns: {
          category_id: string
          created_at: string
          description: string
          id: string
          name: string
          slug: string
        }[]
      }
    }
    Enums: {
      content_visibility: "STANDARD_ONLY" | "PREMIUM_ONLY" | "BOTH"
      order_status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED"
      pricing_scope: "GLOBAL" | "CATEGORY" | "PRODUCT"
      user_level: "NONE" | "STANDARD" | "PREMIUM"
      user_status: "ACTIVE" | "SUSPENDED"
      verification_status: "PENDING" | "APPROVED" | "REJECTED"
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
      content_visibility: ["STANDARD_ONLY", "PREMIUM_ONLY", "BOTH"],
      order_status: ["PENDING", "PAID", "CANCELLED", "REFUNDED"],
      user_level: ["NONE", "STANDARD", "PREMIUM"],
      user_status: ["ACTIVE", "SUSPENDED"],
      verification_status: ["PENDING", "APPROVED", "REJECTED"],
    },
  },
} as const

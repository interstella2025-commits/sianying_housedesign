export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InquiryStatus = "new" | "contacted" | "qualified" | "closed" | "spam";
export type PublishStatus = "draft" | "published";

export type Database = {
  public: {
    Tables: {
      sianying_cms_documents: {
        Row: {
          key: string;
          data: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          data: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          data?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      sianying_inquiries: {
        Row: {
          id: string;
          created_at: string;
          form_type: "consultation" | "reservation";
          name: string;
          phone: string;
          email: string | null;
          house_age: string | null;
          location: string | null;
          budget: string | null;
          project_type: string | null;
          message: string | null;
          line_id: string | null;
          source_path: string;
          visitor_hash: string;
          status: "new" | "contacted" | "closed";
        };
        Insert: {
          id?: string;
          created_at?: string;
          form_type: "consultation" | "reservation";
          name: string;
          phone: string;
          email?: string | null;
          house_age?: string | null;
          location?: string | null;
          budget?: string | null;
          project_type?: string | null;
          message?: string | null;
          line_id?: string | null;
          source_path?: string;
          visitor_hash: string;
          status?: "new" | "contacted" | "closed";
        };
        Update: Partial<Database["public"]["Tables"]["sianying_inquiries"]["Row"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          source: string;
          name: string;
          contact: string;
          message: string | null;
          metadata: Json;
          status: InquiryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          source?: string;
          name: string;
          contact: string;
          message?: string | null;
          metadata?: Json;
          status?: InquiryStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          name?: string;
          contact?: string;
          message?: string | null;
          metadata?: Json;
          status?: InquiryStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          puck_data: Json;
          status: PublishStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          puck_data?: Json;
          status?: PublishStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          puck_data?: Json;
          status?: PublishStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          legacy_id: string | null;
          slug: string;
          title: string;
          legacy_title: string | null;
          summary: string | null;
          region: string | null;
          cover_url: string | null;
          image_count: number;
          featured: boolean;
          status: PublishStatus;
          payload: Json;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legacy_id?: string | null;
          slug: string;
          title: string;
          legacy_title?: string | null;
          summary?: string | null;
          region?: string | null;
          cover_url?: string | null;
          image_count?: number;
          featured?: boolean;
          status?: PublishStatus;
          payload?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legacy_id?: string | null;
          slug?: string;
          title?: string;
          legacy_title?: string | null;
          summary?: string | null;
          region?: string | null;
          cover_url?: string | null;
          image_count?: number;
          featured?: boolean;
          status?: PublishStatus;
          payload?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          phone: string | null;
          mobile: string | null;
          line_id: string | null;
          address: string | null;
          service_area: string[] | null;
          social_links: Json;
          credentials: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          phone?: string | null;
          mobile?: string | null;
          line_id?: string | null;
          address?: string | null;
          service_area?: string[] | null;
          social_links?: Json;
          credentials?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          phone?: string | null;
          mobile?: string | null;
          line_id?: string | null;
          address?: string | null;
          service_area?: string[] | null;
          social_links?: Json;
          credentials?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      sianying_bk_projects: {
        Row: {
          id: string;
          name: string;
          client_name: string | null;
          client_phone: string | null;
          client_tax_id: string | null;
          client_invoice_tax_mode: string;
          client_invoice_no: string | null;
          design_invoice_tax_mode: string;
          design_invoice_no: string | null;
          prepayment_invoice_tax_mode: string;
          prepayment_invoice_no: string | null;
          address: string | null;
          design_fee_amount: number;
          prepayment_amount: number;
          contract_amount: number;
          status: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_name?: string | null;
          client_phone?: string | null;
          client_tax_id?: string | null;
          client_invoice_tax_mode?: string;
          client_invoice_no?: string | null;
          design_invoice_tax_mode?: string;
          design_invoice_no?: string | null;
          prepayment_invoice_tax_mode?: string;
          prepayment_invoice_no?: string | null;
          address?: string | null;
          design_fee_amount?: number;
          prepayment_amount?: number;
          contract_amount?: number;
          status?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_name?: string | null;
          client_phone?: string | null;
          client_tax_id?: string | null;
          client_invoice_tax_mode?: string;
          client_invoice_no?: string | null;
          design_invoice_tax_mode?: string;
          design_invoice_no?: string | null;
          prepayment_invoice_tax_mode?: string;
          prepayment_invoice_no?: string | null;
          address?: string | null;
          design_fee_amount?: number;
          prepayment_amount?: number;
          contract_amount?: number;
          status?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sianying_bk_vendors: {
        Row: {
          id: string;
          name: string;
          trade: string | null;
          contact_name: string | null;
          phone: string | null;
          tax_id: string | null;
          bank_info: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trade?: string | null;
          contact_name?: string | null;
          phone?: string | null;
          tax_id?: string | null;
          bank_info?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          trade?: string | null;
          contact_name?: string | null;
          phone?: string | null;
          tax_id?: string | null;
          bank_info?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sianying_bk_project_incomes: {
        Row: {
          id: string;
          project_id: string;
          received_date: string;
          income_category: string;
          amount: number;
          payment_method: string;
          reference_no: string | null;
          invoice_tax_mode: string;
          client_invoice_status: string;
          client_invoice_no: string | null;
          tax_status: string;
          tax_amount: number | null;
          tax_paid_date: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          received_date: string;
          income_category: string;
          amount: number;
          payment_method?: string;
          reference_no?: string | null;
          invoice_tax_mode?: string;
          client_invoice_status?: string;
          client_invoice_no?: string | null;
          tax_status?: string;
          tax_amount?: number | null;
          tax_paid_date?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          received_date?: string;
          income_category?: string;
          amount?: number;
          payment_method?: string;
          reference_no?: string | null;
          invoice_tax_mode?: string;
          client_invoice_status?: string;
          client_invoice_no?: string | null;
          tax_status?: string;
          tax_amount?: number | null;
          tax_paid_date?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sianying_bk_project_expenses: {
        Row: {
          id: string;
          project_id: string;
          vendor_id: string;
          expense_date: string;
          trade: string;
          description: string | null;
          payable_amount: number;
          payable_net_amount: number | null;
          due_date: string | null;
          payment_stage: string | null;
          invoice_no: string | null;
          invoice_amount: number | null;
          vendor_tax_mode: string;
          vendor_invoice_status: string;
          vendor_invoice_note: string | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          vendor_id: string;
          expense_date: string;
          trade: string;
          description?: string | null;
          payable_amount: number;
          payable_net_amount?: number | null;
          due_date?: string | null;
          payment_stage?: string | null;
          invoice_no?: string | null;
          invoice_amount?: number | null;
          vendor_tax_mode?: string;
          vendor_invoice_status?: string;
          vendor_invoice_note?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          vendor_id?: string;
          expense_date?: string;
          trade?: string;
          description?: string | null;
          payable_amount?: number;
          payable_net_amount?: number | null;
          due_date?: string | null;
          payment_stage?: string | null;
          invoice_no?: string | null;
          invoice_amount?: number | null;
          vendor_tax_mode?: string;
          vendor_invoice_status?: string;
          vendor_invoice_note?: string | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sianying_bk_expense_payments: {
        Row: {
          id: string;
          expense_id: string;
          paid_date: string;
          amount: number;
          payment_method: string;
          reference_no: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          paid_date: string;
          amount: number;
          payment_method?: string;
          reference_no?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          paid_date?: string;
          amount?: number;
          payment_method?: string;
          reference_no?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

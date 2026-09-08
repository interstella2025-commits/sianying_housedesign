type InquiryRow = {
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

export type Database = {
  public: {
    Tables: {
      sianying_inquiries: {
        Row: InquiryRow;
        Insert: Pick<InquiryRow, "form_type" | "name" | "phone" | "visitor_hash"> &
          Partial<InquiryRow>;
        Update: Partial<InquiryRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

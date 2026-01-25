export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      about_info: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          is_published: boolean;
          portrait_url: string | null;
          published_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          is_published?: boolean;
          portrait_url?: string | null;
          published_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          is_published?: boolean;
          portrait_url?: string | null;
          published_at?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          is_sale_active: boolean;
          price: number | null;
          section_id: string;
          stock_qty: number;
          stripe_link: string | null;
        };
        Insert: {
          is_sale_active?: boolean;
          price?: number | null;
          section_id: string;
          stock_qty?: number;
          stripe_link?: string | null;
        };
        Update: {
          is_sale_active?: boolean;
          price?: number | null;
          section_id?: string;
          stock_qty?: number;
          stripe_link?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: true;
            referencedRelation: 'sections';
            referencedColumns: ['id'];
          },
        ];
      };
      news_posts: {
        Row: {
          category: string | null;
          content: string | null;
          created_at: string;
          external_link: string | null;
          id: string;
          image_url: string | null;
          is_published: boolean;
          published_at: string | null;
          summary: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          external_link?: string | null;
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          summary?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          content?: string | null;
          created_at?: string;
          external_link?: string | null;
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          summary?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      section_items: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_published: boolean;
          is_sale_active: boolean | null;
          order_rank: number | null;
          price: number | null;
          published_at: string;
          section_id: string;
          stock_qty: number | null;
          stripe_link: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          is_sale_active?: boolean | null;
          order_rank?: number | null;
          price?: number | null;
          published_at?: string;
          section_id: string;
          stock_qty?: number | null;
          stripe_link?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_published?: boolean;
          is_sale_active?: boolean | null;
          order_rank?: number | null;
          price?: number | null;
          published_at?: string;
          section_id?: string;
          stock_qty?: number | null;
          stripe_link?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'section_items_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'sections';
            referencedColumns: ['id'];
          },
        ];
      };
      sections: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          img_url: string | null;
          is_published: boolean;
          order_rank: number;
          published_at: string;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          img_url?: string | null;
          is_published?: boolean;
          order_rank: number;
          published_at?: string;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          img_url?: string | null;
          is_published?: boolean;
          order_rank?: number;
          published_at?: string;
          title?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

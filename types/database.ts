export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            sections: {
                Row: {
                    id: string
                    created_at: string
                    img_url: string | null
                    description: string | null
                    title: string | null
                    order_rank: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    img_url?: string | null
                    description?: string | null
                    title?: string | null
                    order_rank: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    img_url?: string | null
                    description?: string | null
                    title?: string | null
                    order_rank?: number
                }
            }
            inventory: {
                Row: {
                    section_id: string
                    stock_qty: number
                    price: number | null
                    stripe_link: string | null
                    is_sale_active: boolean
                }
                Insert: {
                    section_id: string
                    stock_qty?: number
                    price?: number | null
                    stripe_link?: string | null
                    is_sale_active?: boolean
                }
                Update: {
                    section_id?: string
                    stock_qty?: number
                    price?: number | null
                    stripe_link?: string | null
                    is_sale_active?: boolean
                }
            }
            about_info: {
                Row: {
                    id: number
                    created_at: string
                    description: string | null
                    portrait_url: string | null
                }
                Insert: {
                    id?: number
                    created_at?: string
                    description?: string | null
                    portrait_url?: string | null
                }
                Update: {
                    id?: number
                    created_at?: string
                    description?: string | null
                    portrait_url?: string | null
                }
            }
            news_posts: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    content: string | null
                    image_url: string | null
                    is_published: boolean | null
                    published_at: string | null
                    summary: string | null
                    category: string | null
                    external_link: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    content?: string | null
                    image_url?: string | null
                    is_published?: boolean | null
                    published_at?: string | null
                    summary?: string | null
                    category?: string | null
                    external_link?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    content?: string | null
                    image_url?: string | null
                    is_published?: boolean | null
                    published_at?: string | null
                    summary?: string | null
                    category?: string | null
                    external_link?: string | null
                    updated_at?: string | null
                }
            }
            section_items: {
                Row: {
                    id: string
                    created_at: string
                    section_id: string
                    title: string | null
                    description: string | null
                    image_url: string | null
                    price: number | null
                    stock_qty: number | null
                    stripe_link: string | null
                    is_sale_active: boolean | null
                    order_rank: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    section_id: string
                    title?: string | null
                    description?: string | null
                    image_url?: string | null
                    price?: number | null
                    stock_qty?: number | null
                    stripe_link?: string | null
                    is_sale_active?: boolean | null
                    order_rank?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    section_id?: string
                    title?: string | null
                    description?: string | null
                    image_url?: string | null
                    price?: number | null
                    stock_qty?: number | null
                    stripe_link?: string | null
                    is_sale_active?: boolean | null
                    order_rank?: number | null
                }
            }
        }
    }
}

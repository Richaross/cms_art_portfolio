// NOTE: For Server Actions, we should use a Server Client usually,
// but sticking to the existing pattern for now, we will adapt to server-side usage in actions.
// Actually, this service is intended to be used *inside* server actions, so it should probably take a client or create a server client.
// However, 'createClient' in `lib/supabase/client` implies browser usage.
// We'll assume this service runs on server and uses the server-side supabase client if passed, or we'll abstract it.

// To keep it simple and strictly separating concerns, let's inject the client or use a strictly server-side creation if needed.
// But mostly we typically use `createServerComponentClient` or similar in Next.js.
// For now, let's make these functions accept a SupabaseClient to remain stateless,
// OR assume they are running in a context where we can get the admin client.

import { Database } from '@/types/database';
import { NewsPost } from '@/app/domain/types';

// We will use standard supabase-js for the service layer to keep it generic
// In a real Next.js server action, we might use the cookie-based client.
// Let's define the methods to take the client as an argument for maximum flexibility (Dependency Injection).

import { SupabaseClient } from '@supabase/supabase-js';

export class NewsService {
  static async getAll(supabase: SupabaseClient<Database>): Promise<NewsPost[]> {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(this.mapToDomain);
  }

  static async upsert(supabase: SupabaseClient<Database>, post: Partial<NewsPost>): Promise<void> {
    // Map domain back to DB Row
    const dbRow: Database['public']['Tables']['news_posts']['Insert'] = {
      id: post.id,
      title: post.title!, // Assumption: Title is required
      summary: post.summary,
      category: post.category,
      content: post.content,
      image_url: post.imageUrl,
      external_link: post.externalLink,
      is_published: post.isPublished,
      published_at: post.publishedAt?.toISOString(),
      // created_at is auto-handled if new, but preserved if exists? Supabase handles it.
      // updated_at can be set to now
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('news_posts').upsert(dbRow as any);
    if (error) throw error;
  }

  static async delete(supabase: SupabaseClient<Database>, id: string): Promise<void> {
    const { error } = await supabase.from('news_posts').delete().eq('id', id);
    if (error) throw error;
  }

  // Mapper
  private static mapToDomain(row: Database['public']['Tables']['news_posts']['Row']): NewsPost {
    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category || 'General',
      content: row.content,
      imageUrl: row.image_url,
      externalLink: row.external_link,
      isPublished: row.is_published ?? false,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(row.created_at),
    };
  }
}

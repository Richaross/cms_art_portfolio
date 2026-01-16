import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { NewsPost } from '@/app/domain/types';
import { INewsRepository } from '@/app/domain/repositoryInterfaces';

export class NewsRepository implements INewsRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<NewsPost[]> {
    const { data, error } = await this.supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(this.mapToDomain);
  }

  async upsert(post: Partial<NewsPost>): Promise<void> {
    const dbRow: Database['public']['Tables']['news_posts']['Insert'] = {
      id: post.id,
      title: post.title!,
      summary: post.summary,
      category: post.category,
      content: post.content,
      image_url: post.imageUrl,
      external_link: post.externalLink,
      is_published: post.isPublished,
      published_at: post.publishedAt?.toISOString(),
      updated_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await this.supabase.from('news_posts').upsert(dbRow as any);
    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('news_posts').delete().eq('id', id);
    if (error) throw error;
  }

  private mapToDomain(row: Database['public']['Tables']['news_posts']['Row']): NewsPost {
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

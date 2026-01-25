import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AboutInfo } from '@/app/domain/types';
import { IAboutRepository } from '@/app/domain/repositoryInterfaces';

export class AboutRepository implements IAboutRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async get(): Promise<AboutInfo | null> {
    const { data, error } = await this.supabase.from('about_info').select('*').single();

    if (error || !data) return null;

    return {
      id: data.id,
      description: data.description,
      portraitUrl: data.portrait_url,
      isPublished: data.is_published,
      publishedAt: data.published_at ? new Date(data.published_at) : null,
    };
  }

  async upsert(info: Partial<AboutInfo>): Promise<void> {
    const dbRow: Database['public']['Tables']['about_info']['Insert'] = {
      id: info.id || 1,
      description: info.description,
      portrait_url: info.portraitUrl,
      is_published: info.isPublished,
      published_at: info.publishedAt?.toISOString(),
    };

    const { error } = await this.supabase.from('about_info').upsert(dbRow);
    if (error) throw error;
  }
}

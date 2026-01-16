import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AboutInfo } from '@/app/domain/types';
import { IAboutRepository } from '@/app/domain/repositoryInterfaces';

export class AboutRepository implements IAboutRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async get(): Promise<AboutInfo | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any).from('about_info').select('*').single();

    if (error || !data) return null;

    const row = data as Database['public']['Tables']['about_info']['Row'];
    return {
      id: row.id,
      description: row.description,
      portraitUrl: row.portrait_url,
    };
  }

  async upsert(info: Partial<AboutInfo>): Promise<void> {
    const dbRow: Database['public']['Tables']['about_info']['Insert'] = {
      id: info.id || 1,
      description: info.description,
      portrait_url: info.portraitUrl,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any).from('about_info').upsert(dbRow);
    if (error) throw error;
  }
}

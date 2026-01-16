import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { HeroSettings } from '@/app/domain/types';
import { IHeroRepository } from '@/app/domain/repositoryInterfaces';

interface HeroSettingsRow {
  id: number;
  bg_image_url: string | null;
  title: string | null;
  dim_intensity: number;
  social_links: HeroSettings['socialLinks'];
  social_urls: HeroSettings['socialUrls'];
}

export class HeroRepository implements IHeroRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getSettings(): Promise<HeroSettings> {
    try {
      const { data, error } = await this.supabase
        .from('hero_settings' as never)
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        return this.getDefaultSettings();
      }
      return this.mapToDomain(data as unknown as HeroSettingsRow);
    } catch {
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
    const dbRow = {
      bg_image_url: settings.bgImageUrl,
      title: settings.title,
      dim_intensity: settings.dimIntensity,
      social_links: settings.socialLinks,
      social_urls: settings.socialUrls,
    };

    const { data, error } = await this.supabase
      .from('hero_settings' as never)
      .upsert({ ...dbRow, id: 1 } as never)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDomain(data as unknown as HeroSettingsRow);
  }

  private getDefaultSettings(): HeroSettings {
    return {
      id: 1,
      bgImageUrl:
        'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop',
      title: 'Art Portfolio',
      dimIntensity: 0.4,
      socialLinks: {
        instagram: true,
        linkedin: true,
        facebook: false,
        whatsapp: false,
        x: false,
      },
      socialUrls: {
        instagram: '',
        linkedin: '',
        facebook: '',
        whatsapp: '',
        x: '',
      },
    };
  }

  private mapToDomain(row: HeroSettingsRow): HeroSettings {
    return {
      id: row.id,
      bgImageUrl: row.bg_image_url,
      title: row.title,
      dimIntensity: row.dim_intensity,
      socialLinks: row.social_links,
      socialUrls: row.social_urls,
    };
  }
}

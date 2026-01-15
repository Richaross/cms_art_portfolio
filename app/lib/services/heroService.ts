import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { HeroSettings } from '@/app/domain/types';

interface HeroSettingsRow {
  id: number;
  bg_image_url: string;
  title: string;
  dim_intensity: number;
  social_links: HeroSettings['socialLinks'];
  social_urls: HeroSettings['socialUrls'];
}

export class HeroService {
  /**
   * Fetch the singleton hero settings row.
   */
  static async getSettings(supabase: SupabaseClient<Database>): Promise<HeroSettings> {
    try {
      const { data, error } = await supabase
        .from('hero_settings' as never)
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.warn('Hero settings not found, using defaults:', error);
        return this.getDefaultSettings();
      }
      return this.mapToDomain(data as unknown as HeroSettingsRow);
    } catch (e) {
      console.warn('Unexpected error fetching hero settings:', e);
      return this.getDefaultSettings();
    }
  }

  private static getDefaultSettings(): HeroSettings {
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

  /**
   * Update the singleton hero settings row.
   */
  static async updateSettings(
    supabase: SupabaseClient<Database>,
    settings: Partial<HeroSettings>
  ): Promise<HeroSettings> {
    const dbRow = {
      bg_image_url: settings.bgImageUrl,
      title: settings.title,
      dim_intensity: settings.dimIntensity,
      social_links: settings.socialLinks,
      social_urls: settings.socialUrls,
    };

    const { data, error } = await supabase
      .from('hero_settings' as never)
      .upsert({ ...dbRow, id: 1 } as never)
      .select()
      .single();

    if (error) throw error;
    return this.mapToDomain(data as unknown as HeroSettingsRow);
  }

  /**
   * Map database row to domain model.
   */
  private static mapToDomain(row: HeroSettingsRow): HeroSettings {
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

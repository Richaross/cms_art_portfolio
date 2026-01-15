import { SupabaseClient } from '@supabase/supabase-js';
import { HeroService } from '@/app/lib/services/heroService';
import { HeroSettings } from '@/app/domain/types';

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
} as unknown as SupabaseClient;

describe('HeroService', () => {
  const mockSettings: HeroSettings = {
    id: 1,
    bgImageUrl: 'http://example.com/bg.jpg',
    title: 'Test Title',
    dimIntensity: 0.4,
    socialLinks: {
      instagram: true,
      linkedin: true,
      facebook: false,
      whatsapp: false,
      x: false,
    },
    socialUrls: {
      instagram: 'insta',
      linkedin: 'linked',
      facebook: '',
      whatsapp: '',
      x: '',
    },
  };

  const dbRow = {
    id: 1,
    bg_image_url: 'http://example.com/bg.jpg',
    title: 'Test Title',
    dim_intensity: 0.4,
    social_links: {
      instagram: true,
      linkedin: true,
      facebook: false,
      whatsapp: false,
      x: false,
    },
    social_urls: {
      instagram: 'insta',
      linkedin: 'linked',
      facebook: '',
      whatsapp: '',
      x: '',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch hero settings', async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: dbRow,
      error: null,
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: singleMock,
    });

    const result = await HeroService.getSettings(mockSupabase);

    expect(result).toEqual(mockSettings);
    expect(mockSupabase.from).toHaveBeenCalledWith('hero_settings');
  });

  it('should update hero settings', async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: dbRow,
      error: null,
    });

    (mockSupabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: singleMock,
    });

    const result = await HeroService.updateSettings(mockSupabase, mockSettings);

    expect(result).toEqual(mockSettings);
    expect(mockSupabase.from).toHaveBeenCalledWith('hero_settings');
  });
});

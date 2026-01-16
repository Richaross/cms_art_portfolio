import { HeroService } from '@/app/lib/services/heroService';
import { IHeroRepository } from '@/app/domain/repositoryInterfaces';
import { HeroSettings } from '@/app/domain/types';

describe('HeroService', () => {
  let heroService: HeroService;
  let mockRepository: jest.Mocked<IHeroRepository>;

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

  beforeEach(() => {
    mockRepository = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };
    heroService = new HeroService(mockRepository);
  });

  it('should fetch hero settings from repository', async () => {
    mockRepository.getSettings.mockResolvedValue(mockSettings);

    const result = await heroService.getSettings();

    expect(result).toEqual(mockSettings);
    expect(mockRepository.getSettings).toHaveBeenCalled();
  });

  it('should update hero settings via repository', async () => {
    mockRepository.updateSettings.mockResolvedValue(mockSettings);

    const result = await heroService.updateSettings(mockSettings);

    expect(result).toEqual(mockSettings);
    expect(mockRepository.updateSettings).toHaveBeenCalledWith(mockSettings);
  });
});

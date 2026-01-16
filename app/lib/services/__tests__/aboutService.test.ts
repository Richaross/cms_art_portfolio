import { AboutService } from '../aboutService';
import { IAboutRepository } from '@/app/domain/repositoryInterfaces';
import { AboutInfo } from '@/app/domain/types';

describe('AboutService', () => {
  let aboutService: AboutService;
  let mockRepository: jest.Mocked<IAboutRepository>;

  beforeEach(() => {
    mockRepository = {
      get: jest.fn(),
      upsert: jest.fn(),
    };
    aboutService = new AboutService(mockRepository);
  });

  describe('get', () => {
    it('should return about info from repository', async () => {
      const mockInfo: AboutInfo = {
        id: 1,
        description: 'Test Description',
        portraitUrl: 'http://example.com/portait.jpg',
      };
      mockRepository.get.mockResolvedValue(mockInfo);

      const result = await aboutService.get();

      expect(result).toEqual(mockInfo);
      expect(mockRepository.get).toHaveBeenCalled();
    });

    it('should return null if repository returns null', async () => {
      mockRepository.get.mockResolvedValue(null);

      const result = await aboutService.get();

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should call repository upsert with info', async () => {
      const mockInfo: Partial<AboutInfo> = {
        description: 'New Description',
      };

      await aboutService.upsert(mockInfo);

      expect(mockRepository.upsert).toHaveBeenCalledWith(mockInfo);
    });
  });
});

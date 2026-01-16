import { NewsService } from '../newsService';
import { INewsRepository } from '@/app/domain/repositoryInterfaces';
import { NewsPost } from '@/app/domain/types';

describe('NewsService', () => {
  let newsService: NewsService;
  let mockRepository: jest.Mocked<INewsRepository>;

  const mockPost: NewsPost = {
    id: '1',
    title: 'Test Post',
    summary: 'Test Summary',
    category: 'General',
    content: 'Test Content',
    imageUrl: 'http://example.com/img.jpg',
    externalLink: null,
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    };
    newsService = new NewsService(mockRepository);
  });

  it('should get all news posts', async () => {
    mockRepository.getAll.mockResolvedValue([mockPost]);
    const result = await newsService.getAll();
    expect(result).toEqual([mockPost]);
    expect(mockRepository.getAll).toHaveBeenCalled();
  });

  it('should upsert news post', async () => {
    await newsService.upsert(mockPost);
    expect(mockRepository.upsert).toHaveBeenCalledWith(mockPost);
  });

  it('should delete news post', async () => {
    await newsService.delete('1');
    expect(mockRepository.delete).toHaveBeenCalledWith('1');
  });
});

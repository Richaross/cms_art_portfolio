import { PortfolioService } from '../portfolioService';
import { IPortfolioRepository } from '@/app/domain/repositoryInterfaces';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;
  let mockRepository: jest.Mocked<IPortfolioRepository>;

  const mockSection: PortfolioSection = {
    id: '1',
    title: 'Test Section',
    description: 'Test Description',
    imgUrl: 'http://example.com/img.jpg',
    orderRank: 0,
    inventory: null,
    items: [],
  };

  beforeEach(() => {
    mockRepository = {
      getAll: jest.fn(),
      getById: jest.fn(),
      upsertSection: jest.fn(),
      upsertInventory: jest.fn(),
      upsertItem: jest.fn(),
      deleteItem: jest.fn(),
      deleteSection: jest.fn(),
    } as unknown as jest.Mocked<IPortfolioRepository>;
    portfolioService = new PortfolioService(mockRepository);
  });

  it('should get all sections', async () => {
    mockRepository.getAll.mockResolvedValue([mockSection]);
    const result = await portfolioService.getAll();
    expect(result).toEqual([mockSection]);
    expect(mockRepository.getAll).toHaveBeenCalled();
  });

  it('should get section by id', async () => {
    mockRepository.getById.mockResolvedValue(mockSection);
    const result = await portfolioService.getById('1');
    expect(result).toEqual(mockSection);
    expect(mockRepository.getById).toHaveBeenCalledWith('1');
  });

  it('should upsert section', async () => {
    mockRepository.upsertSection.mockResolvedValue({ id: '1' });
    const result = await portfolioService.upsertSection(mockSection);
    expect(result).toEqual(mockSection);
    expect(mockRepository.upsertSection).toHaveBeenCalledWith(mockSection);
  });

  it('should upsert inventory', async () => {
    const mockInventory: InventoryItem = {
      sectionId: '1',
      stockQty: 10,
      price: 100,
      isSaleActive: true,
      stripeLink: null,
    };
    await portfolioService.upsertInventory(mockInventory);
    expect(mockRepository.upsertInventory).toHaveBeenCalledWith(mockInventory);
  });

  it('should upsert item', async () => {
    const mockItem: SectionItem = {
      id: '2',
      sectionId: '1',
      title: 'Test Item',
      description: 'Test Description',
      imageUrl: 'http://example.com/item.jpg',
      price: 50,
      stockQty: 5,
      isSaleActive: true,
      orderRank: 0,
      stripeLink: null,
    };
    mockRepository.upsertItem.mockResolvedValue(mockItem);
    const result = await portfolioService.upsertItem(mockItem);
    expect(result).toEqual(mockItem);
    expect(mockRepository.upsertItem).toHaveBeenCalledWith(mockItem);
  });

  it('should delete item', async () => {
    await portfolioService.deleteItem('2');
    expect(mockRepository.deleteItem).toHaveBeenCalledWith('2');
  });

  it('should delete section', async () => {
    await portfolioService.deleteSection('1');
    expect(mockRepository.deleteSection).toHaveBeenCalledWith('1');
  });
});

import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';
import { IPortfolioRepository } from '@/app/domain/repositoryInterfaces';
import { IPortfolioService } from '@/app/domain/serviceInterfaces';

export class PortfolioService implements IPortfolioService {
  constructor(private repository: IPortfolioRepository) {}

  async getAll(): Promise<PortfolioSection[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<PortfolioSection | null> {
    return this.repository.getById(id);
  }

  async upsertSection(section: Partial<PortfolioSection>): Promise<PortfolioSection> {
    const { id } = await this.repository.upsertSection(section);
    return { ...section, id } as PortfolioSection;
  }

  async upsertInventory(inventory: InventoryItem): Promise<void> {
    await this.repository.upsertInventory(inventory);
  }

  async upsertItem(item: SectionItem): Promise<SectionItem> {
    return this.repository.upsertItem(item);
  }

  async deleteItem(id: string): Promise<void> {
    await this.repository.deleteItem(id);
  }

  async deleteSection(id: string): Promise<void> {
    await this.repository.deleteSection(id);
  }

  async deleteItems(ids: string[]): Promise<void> {
    return this.repository.deleteItems(ids);
  }

  async updateItems(ids: string[], updates: Partial<SectionItem>): Promise<void> {
    return this.repository.updateItems(ids, updates);
  }

  async reorderSections(items: { id: string; orderRank: number }[]): Promise<void> {
    await this.repository.updateSectionOrder(items);
  }

  async reorderItems(items: { id: string; orderRank: number }[]): Promise<void> {
    await this.repository.updateItemOrder(items);
  }
}

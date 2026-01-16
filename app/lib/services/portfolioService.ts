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
}

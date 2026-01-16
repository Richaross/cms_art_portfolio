import {
  AboutInfo,
  PortfolioSection,
  InventoryItem,
  SectionItem,
  NewsPost,
  HeroSettings,
} from './types';

export interface IAboutRepository {
  get(): Promise<AboutInfo | null>;
  upsert(info: Partial<AboutInfo>): Promise<void>;
}

export interface IPortfolioRepository {
  getAll(): Promise<PortfolioSection[]>;
  getById(id: string): Promise<PortfolioSection | null>;
  upsertSection(section: Partial<PortfolioSection>): Promise<{ id: string }>;
  upsertInventory(inventory: InventoryItem): Promise<void>;
  upsertItem(item: SectionItem): Promise<SectionItem>;
  deleteItem(id: string): Promise<void>;
  deleteSection(id: string): Promise<void>;
}

export interface INewsRepository {
  getAll(): Promise<NewsPost[]>;
  upsert(post: Partial<NewsPost>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IHeroRepository {
  getSettings(): Promise<HeroSettings>;
  updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings>;
}

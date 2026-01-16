import {
  AboutInfo,
  PortfolioSection,
  InventoryItem,
  SectionItem,
  NewsPost,
  HeroSettings,
} from './types';

export interface IAboutService {
  get(): Promise<AboutInfo | null>;
  upsert(info: Partial<AboutInfo>): Promise<void>;
}

export interface IPortfolioService {
  getAll(): Promise<PortfolioSection[]>;
  getById(id: string): Promise<PortfolioSection | null>;
  upsertSection(section: Partial<PortfolioSection>): Promise<PortfolioSection>;
  upsertInventory(inventory: InventoryItem): Promise<void>;
  upsertItem(item: SectionItem): Promise<SectionItem>;
  deleteItem(id: string): Promise<void>;
  deleteSection(id: string): Promise<void>;
}

export interface INewsService {
  getAll(): Promise<NewsPost[]>;
  upsert(post: Partial<NewsPost>): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IHeroService {
  getSettings(): Promise<HeroSettings>;
  updateSettings(settings: Partial<HeroSettings>): Promise<HeroSettings>;
}

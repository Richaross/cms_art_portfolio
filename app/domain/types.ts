export interface NewsPost {
  id: string;
  title: string;
  summary: string | null;
  category: string;
  content: string | null;
  imageUrl: string | null;
  externalLink: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSection {
  id: string;
  title: string | null;
  description: string | null;
  imgUrl: string | null;
  orderRank: number;
  // Relations
  items?: SectionItem[];
  inventory?: InventoryItem | null; // Keeping for backward compat logic if needed, but moving towards items
}

export interface SectionItem {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  stockQty: number;
  stripeLink: string | null;
  isSaleActive: boolean;
  orderRank: number;
}

export interface InventoryItem {
  sectionId: string;
  stockQty: number;
  price: number | null;
  stripeLink: string | null;
  isSaleActive: boolean;
}

export interface AboutInfo {
  id: number;
  description: string | null;
  portraitUrl: string | null;
}

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
  isPublished: boolean;
  publishedAt: Date | null;
  // Relations
  items?: SectionItem[];
  inventory?: InventoryItem | null;
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
  isPublished: boolean;
  publishedAt: Date | null;
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
  isPublished: boolean;
  publishedAt: Date | null;
}

export interface HeroSettings {
  id: number;
  bgImageUrl: string | null;
  title: string | null;
  dimIntensity: number;
  socialLinks: {
    instagram: boolean;
    linkedin: boolean;
    facebook: boolean;
    whatsapp: boolean;
    x: boolean;
  };
  socialUrls: {
    instagram: string;
    linkedin: string;
    facebook: string;
    whatsapp: string;
    x: string;
  };
}

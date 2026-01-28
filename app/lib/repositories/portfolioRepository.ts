import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';
import { IPortfolioRepository } from '@/app/domain/repositoryInterfaces';

export class PortfolioRepository implements IPortfolioRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(): Promise<PortfolioSection[]> {
    const { data, error } = await this.supabase
      .from('sections')
      .select(
        `
        *,
        inventory (*),
        section_items (*)
      `
      )
      .order('order_rank', { ascending: true })
      .order('order_rank', { foreignTable: 'section_items', ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((row) => this.mapToDomain(row));
  }

  async getById(id: string): Promise<PortfolioSection | null> {
    const { data, error } = await this.supabase
      .from('sections')
      .select(
        `
        *,
        inventory (*),
        section_items (*)
      `
      )
      .eq('id', id)
      .order('order_rank', { foreignTable: 'section_items', ascending: true })
      .single();

    if (error) return null;
    if (!data) return null;

    return this.mapToDomain(data);
  }

  async upsertSection(section: Partial<PortfolioSection>): Promise<{ id: string }> {
    const dbRow: Database['public']['Tables']['sections']['Insert'] = {
      id: section.id,
      title: section.title,
      description: section.description,
      img_url: section.imgUrl,
      order_rank: section.orderRank || 0,
      is_published: section.isPublished,
      published_at: section.publishedAt?.toISOString(),
    };

    const { data, error } = await this.supabase.from('sections').upsert(dbRow).select().single();

    if (error) throw error;
    return { id: data.id };
  }

  async upsertInventory(inventory: InventoryItem): Promise<void> {
    const dbRow: Database['public']['Tables']['inventory']['Insert'] = {
      section_id: inventory.sectionId,
      stock_qty: inventory.stockQty,
      price: inventory.price,
      stripe_link: inventory.stripeLink,
      is_sale_active: inventory.isSaleActive,
    };
    const { error } = await this.supabase.from('inventory').upsert(dbRow);
    if (error) throw error;
  }

  async upsertItem(item: SectionItem): Promise<SectionItem> {
    const dbRow: Database['public']['Tables']['section_items']['Insert'] = {
      id: item.id || undefined,
      section_id: item.sectionId,
      title: item.title,
      description: item.description,
      image_url: item.imageUrl,
      price: item.price,
      stock_qty: item.stockQty,
      stripe_link: item.stripeLink,
      is_sale_active: item.isSaleActive,
      order_rank: item.orderRank,
      is_published: item.isPublished,
      published_at: item.publishedAt?.toISOString(),
    };

    const { data, error } = await this.supabase
      .from('section_items')
      .upsert(dbRow)
      .select()
      .single();

    if (error) throw error;

    return this.mapItemToDomain(data);
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await this.supabase.from('section_items').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteSection(id: string): Promise<void> {
    const { error } = await this.supabase.from('sections').delete().eq('id', id);
    if (error) throw error;
  }

  async deleteItems(ids: string[]): Promise<void> {
    const { error } = await this.supabase.from('section_items').delete().in('id', ids);
    if (error) throw error;
  }

  async updateItems(ids: string[], updates: Partial<SectionItem>): Promise<void> {
    const dbUpdates: Partial<Database['public']['Tables']['section_items']['Update']> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stockQty !== undefined) dbUpdates.stock_qty = updates.stockQty;
    if (updates.stripeLink !== undefined) dbUpdates.stripe_link = updates.stripeLink;
    if (updates.isSaleActive !== undefined) dbUpdates.is_sale_active = updates.isSaleActive;
    if (updates.orderRank !== undefined) dbUpdates.order_rank = updates.orderRank;
    if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
    if (updates.publishedAt !== undefined)
      dbUpdates.published_at = updates.publishedAt?.toISOString();

    const { error } = await this.supabase.from('section_items').update(dbUpdates).in('id', ids);
    if (error) throw error;
  }

  async updateSectionOrder(items: { id: string; orderRank: number }[]): Promise<void> {
    const updates = items.map((item) =>
      this.supabase.from('sections').update({ order_rank: item.orderRank }).eq('id', item.id)
    );
    await Promise.all(updates);
  }

  async updateItemOrder(items: { id: string; orderRank: number }[]): Promise<void> {
    const updates = items.map((item) =>
      this.supabase.from('section_items').update({ order_rank: item.orderRank }).eq('id', item.id)
    );
    await Promise.all(updates);
  }

  private mapToDomain(
    row: Database['public']['Tables']['sections']['Row'] & {
      inventory: Database['public']['Tables']['inventory']['Row'] | null;
      section_items: Database['public']['Tables']['section_items']['Row'][];
    }
  ): PortfolioSection {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imgUrl: row.img_url,
      orderRank: row.order_rank,
      isPublished: row.is_published,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
      inventory: row.inventory
        ? {
            sectionId: row.inventory.section_id,
            stockQty: row.inventory.stock_qty,
            price: row.inventory.price,
            stripeLink: row.inventory.stripe_link,
            isSaleActive: row.inventory.is_sale_active,
          }
        : null,
      items: row.section_items ? row.section_items.map((item) => this.mapItemToDomain(item)) : [],
    };
  }

  private mapItemToDomain(row: Database['public']['Tables']['section_items']['Row']): SectionItem {
    return {
      id: row.id,
      sectionId: row.section_id,
      title: row.title || 'Untitled',
      description: row.description,
      imageUrl: row.image_url,
      price: row.price || 0,
      stockQty: row.stock_qty || 0,
      stripeLink: row.stripe_link,
      isSaleActive: row.is_sale_active || false,
      orderRank: row.order_rank || 0,
      isPublished: row.is_published,
      publishedAt: row.published_at ? new Date(row.published_at) : null,
    };
  }
}

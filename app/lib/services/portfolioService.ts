import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';

export class PortfolioService {
  static async getAll(supabase: SupabaseClient<Database>): Promise<PortfolioSection[]> {
    const { data, error } = await supabase
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

    return data.map(this.mapToDomain);
  }

  static async getById(
    supabase: SupabaseClient<Database>,
    id: string
  ): Promise<PortfolioSection | null> {
    const { data, error } = await supabase
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

  static async upsertSection(
    supabase: SupabaseClient<Database>,
    section: Partial<PortfolioSection>
  ): Promise<PortfolioSection> {
    const dbRow: Database['public']['Tables']['sections']['Insert'] = {
      id: section.id,
      title: section.title,
      description: section.description,
      img_url: section.imgUrl,
      order_rank: section.orderRank || 0,
    };

    const { data, error } = await supabase
      .from('sections')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(dbRow as any)
      .select()
      .single();

    if (error) throw error;

    // Return mostly for the ID if it was new
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultData = data as any;
    return { ...section, id: resultData.id } as PortfolioSection;
  }

  static async upsertInventory(
    supabase: SupabaseClient<Database>,
    inventory: InventoryItem
  ): Promise<void> {
    const dbRow: Database['public']['Tables']['inventory']['Insert'] = {
      section_id: inventory.sectionId,
      stock_qty: inventory.stockQty,
      price: inventory.price,
      stripe_link: inventory.stripeLink,
      is_sale_active: inventory.isSaleActive,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from('inventory').upsert(dbRow as any);
    if (error) throw error;
  }

  // --- Item Methods ---

  static async upsertItem(
    supabase: SupabaseClient<Database>,
    item: SectionItem
  ): Promise<SectionItem> {
    const dbRow: Database['public']['Tables']['section_items']['Insert'] = {
      id: item.id || undefined, // Allow auto-gen for new
      section_id: item.sectionId,
      title: item.title,
      description: item.description,
      image_url: item.imageUrl,
      price: item.price,
      stock_qty: item.stockQty,
      stripe_link: item.stripeLink,
      is_sale_active: item.isSaleActive,
      order_rank: item.orderRank,
    };

    const { data, error } = await supabase
      .from('section_items')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(dbRow as any)
      .select()
      .single();

    if (error) throw error;

    return this.mapItemToDomain(data);
  }

  static async deleteItem(supabase: SupabaseClient<Database>, id: string): Promise<void> {
    const { error } = await supabase.from('section_items').delete().eq('id', id);
    if (error) throw error;
  }

  static async delete(supabase: SupabaseClient<Database>, id: string): Promise<void> {
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToDomain(row: any): PortfolioSection {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imgUrl: row.img_url,
      orderRank: row.order_rank,
      inventory: row.inventory
        ? {
            sectionId: row.inventory.section_id,
            stockQty: row.inventory.stock_qty,
            price: row.inventory.price,
            stripeLink: row.inventory.stripe_link,
            isSaleActive: row.inventory.is_sale_active,
          }
        : null,
      items: row.section_items ? row.section_items.map(PortfolioService.mapItemToDomain) : [],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapItemToDomain(row: any): SectionItem {
    return {
      id: row.id,
      sectionId: row.section_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      price: row.price,
      stockQty: row.stock_qty,
      stripeLink: row.stripe_link,
      isSaleActive: row.is_sale_active,
      orderRank: row.order_rank,
    };
  }
}

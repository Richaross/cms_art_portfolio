'use server';

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/app/lib/services/portfolioService';
import { PortfolioRepository } from '@/app/lib/repositories/portfolioRepository';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
}

async function getPortfolioService() {
  const supabase = await createClient();
  const repository = new PortfolioRepository(supabase);
  return new PortfolioService(repository);
}

// --- Validation Schemas ---

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  imgUrl: z.string().nullable().optional(),
  orderRank: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.date().nullable().optional(),
});

const inventorySchema = z.object({
  sectionId: z.string().min(1),
  stockQty: z.number().int().min(0),
  price: z.number().min(0).nullable(),
  stripeLink: z.string().nullable().optional(),
  isSaleActive: z.boolean(),
});

const itemSchema = z.object({
  id: z.string(),
  sectionId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  imageUrl: z.string().nullable(),
  price: z.number().min(0),
  stockQty: z.number().int().min(0),
  stripeLink: z.string().nullable(),
  isSaleActive: z.boolean(),
  orderRank: z.number().int().min(0),
  isPublished: z.boolean(),
  publishedAt: z.date().nullable(),
});

const reorderSchema = z
  .array(z.object({ id: z.string().min(1), orderRank: z.number().int().min(0) }))
  .min(1);

// --- Read Actions (public) ---

export async function getPortfolioSections(): Promise<PortfolioSection[]> {
  const service = await getPortfolioService();
  return service.getAll();
}

// --- Mutating Actions (require auth) ---

export async function saveSection(
  section: Partial<PortfolioSection>,
  inventory?: InventoryItem
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = sectionSchema.parse(section);
    const service = await getPortfolioService();
    const savedSection = await service.upsertSection(parsed);

    if (inventory && savedSection.id) {
      const parsedInventory = inventorySchema.parse({ ...inventory, sectionId: savedSection.id });
      await service.upsertInventory(parsedInventory);
    }

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save section:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteSection(
  id: string,
  imgUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const validId = z.string().min(1).parse(id);
    const service = await getPortfolioService();
    if (imgUrl) {
      await CloudinaryService.deleteImageByUrl(imgUrl);
    }
    await service.deleteSection(validId);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete section:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveItem(item: SectionItem): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = itemSchema.parse(item);
    const service = await getPortfolioService();
    await service.upsertItem(parsed);
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save item:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteItem(
  id: string,
  imgUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const validId = z.string().min(1).parse(id);
    const service = await getPortfolioService();
    if (imgUrl) {
      await CloudinaryService.deleteImageByUrl(imgUrl);
    }
    await service.deleteItem(validId);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete item:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function reorderSections(
  items: { id: string; orderRank: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = reorderSchema.parse(items);
    const service = await getPortfolioService();
    await service.reorderSections(parsed);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to reorder sections:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function reorderItems(
  items: { id: string; sectionId: string; orderRank: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = z
      .array(
        z.object({
          id: z.string().min(1),
          sectionId: z.string().min(1),
          orderRank: z.number().int().min(0),
        })
      )
      .min(1)
      .parse(items);

    const service = await getPortfolioService();
    await service.reorderItems(parsed);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to reorder items:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteSectionItemsAction(
  items: { id: string; imgUrl?: string | null }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = z
      .array(z.object({ id: z.string().min(1), imgUrl: z.string().nullable().optional() }))
      .min(1)
      .parse(items);

    const service = await getPortfolioService();

    const imageDeletions = parsed
      .filter((item) => item.imgUrl)
      .map((item) => CloudinaryService.deleteImageByUrl(item.imgUrl!));
    await Promise.allSettled(imageDeletions);

    await service.deleteItems(parsed.map((i) => i.id));

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete items:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateSectionItemsAction(
  ids: string[],
  updates: Partial<SectionItem>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const validIds = z.array(z.string().min(1)).min(1).parse(ids);
    const validUpdates = itemSchema.partial().parse(updates);

    const service = await getPortfolioService();
    await service.updateItems(validIds, validUpdates);
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to update items:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

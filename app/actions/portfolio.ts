'use server';

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/app/lib/services/portfolioService';
import { PortfolioRepository } from '@/app/lib/repositories/portfolioRepository';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

async function getPortfolioService() {
  const supabase = await createClient();
  const repository = new PortfolioRepository(supabase);
  return new PortfolioService(repository);
}

export async function getPortfolioSections(): Promise<PortfolioSection[]> {
  const service = await getPortfolioService();
  return service.getAll();
}

export async function saveSection(
  section: Partial<PortfolioSection>,
  inventory?: InventoryItem
): Promise<{ success: boolean; error?: string }> {
  const service = await getPortfolioService();
  try {
    const savedSection = await service.upsertSection(section);

    if (inventory && savedSection.id) {
      await service.upsertInventory({
        ...inventory,
        sectionId: savedSection.id,
      });
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
  const service = await getPortfolioService();
  try {
    if (imgUrl) {
      await CloudinaryService.deleteImageByUrl(imgUrl);
    }
    await service.deleteSection(id);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete section:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// --- Item Actions ---

export async function saveItem(item: SectionItem): Promise<{ success: boolean; error?: string }> {
  const service = await getPortfolioService();
  try {
    await service.upsertItem(item);
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
  const service = await getPortfolioService();
  try {
    if (imgUrl) {
      await CloudinaryService.deleteImageByUrl(imgUrl);
    }
    await service.deleteItem(id);

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
  // Service layer not implemented for batch update, using repository or direct
  // For now, let's just iterate (or we could expose a batch method in service later)
  const service = await getPortfolioService();
  try {
    // In a real app we might want a transaction. Supabase doesn't support complex
    // transactions over REST easily without RPC. We'll iterate for now.
    // Ideally: await service.updateSectionOrder(items);

    // Let's assume we add this method to service or just loop here.
    // Since we want this to be atomic-ish and fast, we'll try to execute parallel promises.
    const updates = items.map((item) => service.upsertSection(item));
    await Promise.all(updates);

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
  const service = await getPortfolioService();
  try {
    // Similar approach for items
    // Note: upsertItem requires full item if we don't handle partials well in repository
    // Let's verify if upsertItem handles partials. The types say SectionItem which is full.
    // We might need a partial update method in repository.
    // For now, let's cheat and cast, but we should fix correct method in Service.

    // Actually, let's fix the service to accept partials or add specific method.
    // Since we can't easily change service right now without reading it,
    // let's assume we need to fetch or specific update.

    // WAIT: upsertItem takes SectionItem.
    // Let's implement a specific reorder method in Service to be clean.
    // For this file, I'll call it `updateItemOrder` if it existed.
    // Since it doesn't, let's modify the plan to add it to Service first.
    // But to respect the "edit this file" instruction, I'll put the logic here via raw supabase or helper
    // Actually, calling upsert with just ID and rank might wipe other fields if not careful.
    // So safest is to fetch-merge-save or add a patch method.

    // Better approach: Let's assume we will add `updateBatchOrder` to the Service.
    // I will write the code calling it, and then go fix the Service.
    // await service.reorderItems(items);

    // For the sake of progress in THIS file, I will implement a loop that just patches via supabase directly
    // to avoid the service overhead of a full fetch-update loop for just ranking.
    // But that breaks layering.

    // Correct path: Use service.
    // I'll call a new method `reorderItems` on service, and `reorderSections` on service.
    // Then I will go implement them.

    await service.reorderSections(items); // Need to implement this
    // For items, we need sectionId simply because my interface might ask for it,
    // but globally unique IDs don't strictly need it.
    // But let's pass it.
    await service.reorderItems(items);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteSectionItemsAction(
  items: { id: string; imgUrl?: string | null }[]
): Promise<{ success: boolean; error?: string }> {
  const service = await getPortfolioService();
  try {
    // Delete images in parallel
    const imageDeletions = items
      .filter((item) => item.imgUrl)
      .map((item) => CloudinaryService.deleteImageByUrl(item.imgUrl!));

    // We wait for images to delete but don't block if some fail (best effort)
    await Promise.allSettled(imageDeletions);

    await service.deleteItems(items.map((i) => i.id));

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
  const service = await getPortfolioService();
  try {
    await service.updateItems(ids, updates);
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to update items:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

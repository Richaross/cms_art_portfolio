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

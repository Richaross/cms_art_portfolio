'use server'

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/app/lib/services/portfolioService';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { PortfolioSection, InventoryItem, SectionItem } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

export async function getPortfolioSections(): Promise<PortfolioSection[]> {
    const supabase = await createClient();
    return PortfolioService.getAll(supabase);
}

export async function saveSection(section: Partial<PortfolioSection>, inventory?: InventoryItem): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        const savedSection = await PortfolioService.upsertSection(supabase, section);

        if (inventory && savedSection.id) {
            await PortfolioService.upsertInventory(supabase, {
                ...inventory,
                sectionId: savedSection.id
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

export async function deleteSection(id: string, imgUrl?: string | null): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        if (imgUrl) {
            await CloudinaryService.deleteImageByUrl(imgUrl);
        }
        await PortfolioService.delete(supabase, id);

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
    const supabase = await createClient();
    try {
        await PortfolioService.upsertItem(supabase, item);
        revalidatePath('/dashboard');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        console.error('Failed to save item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function deleteItem(id: string, imgUrl?: string | null): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        if (imgUrl) {
            await CloudinaryService.deleteImageByUrl(imgUrl);
        }
        await PortfolioService.deleteItem(supabase, id);

        revalidatePath('/dashboard');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        console.error('Failed to delete item:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

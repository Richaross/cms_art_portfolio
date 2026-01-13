'use server'

import { createClient } from '@/lib/supabase/server';
import { NewsService } from '@/app/lib/services/newsService';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { NewsPost } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

export async function getNewsPosts(): Promise<NewsPost[]> {
    const supabase = await createClient();
    return NewsService.getAll(supabase);
}

export async function saveNewsPost(post: Partial<NewsPost>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        await NewsService.upsert(supabase, post);
        revalidatePath('/dashboard');
        revalidatePath('/'); // Revalidate main page/news section
        return { success: true };
    } catch (error: any) {
        console.error('Failed to save news post:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteNewsPost(id: string, imageUrl?: string | null): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        // 1. Delete image from Cloudinary if needed
        if (imageUrl) {
            await CloudinaryService.deleteImageByUrl(imageUrl);
        }

        // 2. Delete from DB
        await NewsService.delete(supabase, id);

        revalidatePath('/dashboard');
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete news post:', error);
        return { success: false, error: error.message };
    }
}

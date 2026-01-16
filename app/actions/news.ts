'use server';

import { createClient } from '@/lib/supabase/server';
import { NewsService } from '@/app/lib/services/newsService';
import { NewsRepository } from '@/app/lib/repositories/newsRepository';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { NewsPost } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

async function getNewsService() {
  const supabase = await createClient();
  const repository = new NewsRepository(supabase);
  return new NewsService(repository);
}

export async function getNewsPosts(): Promise<NewsPost[]> {
  const service = await getNewsService();
  return service.getAll();
}

export async function saveNewsPost(
  post: Partial<NewsPost>
): Promise<{ success: boolean; error?: string }> {
  const service = await getNewsService();
  try {
    await service.upsert(post);
    revalidatePath('/dashboard');
    revalidatePath('/'); // Revalidate main page/news section
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save news post:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteNewsPost(
  id: string,
  imageUrl?: string | null
): Promise<{ success: boolean; error?: string }> {
  const service = await getNewsService();
  try {
    // 1. Delete image from Cloudinary if needed
    if (imageUrl) {
      await CloudinaryService.deleteImageByUrl(imageUrl);
    }

    // 2. Delete from DB
    await service.delete(id);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete news post:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

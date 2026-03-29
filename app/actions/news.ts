'use server';

import { createClient } from '@/lib/supabase/server';
import { NewsService } from '@/app/lib/services/newsService';
import { NewsRepository } from '@/app/lib/repositories/newsRepository';
import { CloudinaryService } from '@/app/lib/services/cloudinaryService';
import { NewsPost } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
}

async function getNewsService() {
  const supabase = await createClient();
  const repository = new NewsRepository(supabase);
  return new NewsService(repository);
}

const newsPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(300),
  summary: z.string().max(1000).nullable().optional(),
  category: z.string().min(1).max(100),
  content: z.string().max(50000).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  externalLink: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.date().nullable().optional(),
});

// --- Read Actions (public) ---

export async function getNewsPosts(): Promise<NewsPost[]> {
  const service = await getNewsService();
  return service.getAll();
}

// --- Mutating Actions (require auth) ---

export async function saveNewsPost(
  post: Partial<NewsPost>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = newsPostSchema.parse(post);
    const service = await getNewsService();
    await service.upsert(parsed);
    revalidatePath('/dashboard');
    revalidatePath('/');
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
  try {
    await requireAuth();
    const validId = z.string().min(1).parse(id);
    const service = await getNewsService();

    if (imageUrl) {
      await CloudinaryService.deleteImageByUrl(imageUrl);
    }
    await service.delete(validId);

    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to delete news post:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

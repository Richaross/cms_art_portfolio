'use server';

import { createClient } from '@/lib/supabase/server';
import { AboutService } from '@/app/lib/services/aboutService';
import { AboutRepository } from '@/app/lib/repositories/aboutRepository';
import { AboutInfo } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
}

async function getAboutService() {
  const supabase = await createClient();
  const repository = new AboutRepository(supabase);
  return new AboutService(repository);
}

const aboutInfoSchema = z.object({
  id: z.number().optional(),
  description: z.string().max(10000).nullable().optional(),
  portraitUrl: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.date().nullable().optional(),
});

// --- Read Actions (public) ---

export async function getAboutInfo(): Promise<AboutInfo | null> {
  const service = await getAboutService();
  return service.get();
}

// --- Mutating Actions (require auth) ---

export async function saveAboutInfo(
  info: Partial<AboutInfo>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const parsed = aboutInfoSchema.parse(info);
    const service = await getAboutService();
    await service.upsert(parsed);
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save about info:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

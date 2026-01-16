'use server';

import { createClient } from '@/lib/supabase/server';
import { AboutService } from '@/app/lib/services/aboutService';
import { AboutRepository } from '@/app/lib/repositories/aboutRepository';
import { AboutInfo } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

async function getAboutService() {
  const supabase = await createClient();
  const repository = new AboutRepository(supabase);
  return new AboutService(repository);
}

export async function getAboutInfo(): Promise<AboutInfo | null> {
  const service = await getAboutService();
  return service.get();
}

export async function saveAboutInfo(
  info: Partial<AboutInfo>
): Promise<{ success: boolean; error?: string }> {
  const service = await getAboutService();
  try {
    await service.upsert(info);
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save about info:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

'use server'

import { createClient } from '@/lib/supabase/server';
import { AboutService } from '@/app/lib/services/aboutService';
import { AboutInfo } from '@/app/domain/types';
import { revalidatePath } from 'next/cache';

export async function getAboutInfo(): Promise<AboutInfo | null> {
    const supabase = await createClient();
    return AboutService.get(supabase);
}

export async function saveAboutInfo(info: Partial<AboutInfo>): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        await AboutService.upset(supabase, info);
        revalidatePath('/dashboard');
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) {
        console.error('Failed to save about info:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

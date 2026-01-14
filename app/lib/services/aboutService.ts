import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { AboutInfo } from '@/app/domain/types';

export class AboutService {
    static async get(supabase: SupabaseClient<Database>): Promise<AboutInfo | null> {
        const { data, error } = await supabase
            .from('about_info')
            .select('*')
            .single();

        if (error || !data) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = data as any;
        return {
            id: result.id,
            description: result.description,
            portraitUrl: result.portrait_url,
        };
    }

    static async upset(supabase: SupabaseClient<Database>, info: Partial<AboutInfo>): Promise<void> {
        const dbRow: Database['public']['Tables']['about_info']['Insert'] = {
            id: info.id || 1, // Default ID concept
            description: info.description,
            portrait_url: info.portraitUrl,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await supabase.from('about_info').upsert(dbRow as any);
        if (error) throw error;
    }
}

import { createClient } from '@/lib/supabase/server';
import { PortfolioService } from '@/app/lib/services/portfolioService';
import { PortfolioRepository } from '@/app/lib/repositories/portfolioRepository';
import { SectionItem } from '@/app/domain/types';

export async function verifyPortfolioService() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log('--- Verifying Portfolio Service ---');
    const supabase = await createClient();
    const repository = new PortfolioRepository(supabase);
    const service = new PortfolioService(repository);

    // 1. Create a Test Section
    log('Creating Test Section...');
    const section = await service.upsertSection({
      title: 'Test Collection',
      description: 'Test Description',
      orderRank: 999,
    });
    log(`Section Created: ${section.id}`);

    // 2. Add an Item to Section
    log('Adding Item...');
    const item: SectionItem = {
      id: '', // New
      sectionId: section.id,
      title: 'Test Item 1',
      description: 'Item Desc',
      imageUrl: null,
      price: 100,
      stockQty: 5,
      stripeLink: null,
      isSaleActive: true,
      orderRank: 0,
    };
    const savedItem = await service.upsertItem(item);
    log(`Item Created: ${savedItem.id}`);

    // 3. Verify Fetch
    log('Fetching Section...');
    const fetchedSection = await service.getById(section.id);
    log(`Fetched Items Count: ${fetchedSection?.items?.length}`);

    if (fetchedSection?.items?.length !== 1) {
      log('❌ Failed: Expected 1 item');
    } else {
      log('✅ Success: Item found');
    }

    // 4. Cleanup
    log('Cleaning up...');
    await service.deleteSection(section.id);
    log('Cleanup Complete');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    log(`❌ Error: ${msg}`);
  }

  return logs;
}

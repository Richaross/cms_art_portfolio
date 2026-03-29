import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPortfolioSections } from '@/app/actions/portfolio';
import DashboardClient from '@/components/cms/DashboardClient';

export default async function DashboardPage() {
  let initialSections: Awaited<ReturnType<typeof getPortfolioSections>> = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    initialSections = await getPortfolioSections().catch(() => []);
  } catch {
    redirect('/login');
  }

  return <DashboardClient initialSections={initialSections} />;
}

export const dynamic = 'force-dynamic';

import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import About from '@/components/About';
import Portfolio from '@/components/Portfolio';
import News from '@/components/News';
import { createClient } from '@/lib/supabase/server';
import { HeroRepository } from '@/app/lib/repositories/heroRepository';
import { HeroService } from '@/app/lib/services/heroService';
import { getAboutInfo } from '@/app/actions/about';
import { getPortfolioSections } from '@/app/actions/portfolio';
import { getNewsPosts } from '@/app/actions/news';

async function getHeroSettings() {
  try {
    const supabase = await createClient();
    const repository = new HeroRepository(supabase);
    const service = new HeroService(repository);
    return await service.getSettings();
  } catch (error) {
    console.error('Error fetching hero settings on server:', error);
    return null;
  }
}

export default async function Home() {
  const [heroSettings, aboutData, portfolioSections, newsPosts] = await Promise.all([
    getHeroSettings(),
    getAboutInfo(),
    getPortfolioSections(),
    getNewsPosts(),
  ]);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="hero">
        <LandingHero initialSettings={heroSettings} />
      </section>

      {/* About Section */}
      <About initialData={aboutData} />

      {/* Portfolio Section */}
      <Portfolio initialSections={portfolioSections} />

      {/* News Section */}
      <News initialPosts={newsPosts} />

      {/* Footer */}
      <footer className="py-8 bg-neutral-950 text-center text-gray-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.</p>
      </footer>
    </main>
  );
}

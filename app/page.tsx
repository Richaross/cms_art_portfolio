'use client';

import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import About from '@/components/About';
import Portfolio from '@/components/Portfolio';
import News from '@/components/News';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="hero">
        <LandingHero />
      </section>

      {/* About Section */}
      <About />

      {/* Portfolio Section */}
      <Portfolio />

      {/* News Section */}
      <News />

      {/* Footer */}
      <footer className="py-8 bg-neutral-950 text-center text-gray-500 text-sm border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.</p>
      </footer>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Instagram, Linkedin, Facebook, Twitter, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { HeroService } from '@/app/lib/services/heroService';
import { HeroRepository } from '@/app/lib/repositories/heroRepository';
import { HeroSettings } from '@/app/domain/types';

interface LandingHeroProps {
  initialSettings?: HeroSettings | null;
}

export default function LandingHero({ initialSettings }: LandingHeroProps) {
  const [settings, setSettings] = useState<HeroSettings | null>(initialSettings || null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // If we have initial settings, we don't necessarily need to fetch immediately
    // unless we want to ensure client-side state is perfectly synced with DB
    if (initialSettings) return;

    async function fetchSettings() {
      try {
        const repository = new HeroRepository(supabase);
        const service = new HeroService(repository);
        const data = await service.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    }
    fetchSettings();
  }, [supabase, initialSettings]);

  // Fallback if settings are not yet loaded (though with SSR they should be)
  const bgImage =
    settings?.bgImageUrl ||
    'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop';
  const title = settings?.title || 'Art Portfolio';
  const dimOpacity = settings?.dimIntensity ?? 0.5;

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Dynamic Background Image */}
      <motion.div
        key={bgImage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1 - dimOpacity, // Apply dim intensity conversely to opacity of the image area
        }}
      />

      {/* Overlay Gradient (Standardized) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/80" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-center px-4"
        >
          {title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex gap-6 mt-4"
        >
          {settings?.socialLinks.instagram && (
            <Link
              href={settings.socialUrls.instagram || '#'}
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <Instagram size={32} strokeWidth={1.5} />
            </Link>
          )}
          {settings?.socialLinks.linkedin && (
            <Link
              href={settings.socialUrls.linkedin || '#'}
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <Linkedin size={32} strokeWidth={1.5} />
            </Link>
          )}
          {settings?.socialLinks.facebook && (
            <Link
              href={settings.socialUrls.facebook || '#'}
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <Facebook size={32} strokeWidth={1.5} />
            </Link>
          )}
          {settings?.socialLinks.x && (
            <Link
              href={settings.socialUrls.x || '#'}
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <Twitter size={32} strokeWidth={1.5} />
            </Link>
          )}
          {settings?.socialLinks.whatsapp && (
            <Link
              href={settings.socialUrls.whatsapp || '#'}
              target="_blank"
              className="hover:text-gray-300 transition-colors"
            >
              <MessageCircle size={32} strokeWidth={1.5} />
            </Link>
          )}

          {/* Default icons if settings never loaded yet or empty */}
          {!settings && (
            <>
              <Instagram size={32} strokeWidth={1.5} className="opacity-20" />
              <Linkedin size={32} strokeWidth={1.5} className="opacity-20" />
            </>
          )}
        </motion.div>
      </div>

      {/* Bottom Fade for Smooth Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
    </div>
  );
}

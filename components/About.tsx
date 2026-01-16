'use client';

import { useEffect, useState } from 'react';
import { getAboutInfo } from '@/app/actions/about';
import { motion } from 'framer-motion';

import { AboutInfo } from '@/app/domain/types';

interface AboutProps {
  initialData?: AboutInfo | null;
}

export default function About({ initialData }: AboutProps) {
  const [description, setDescription] = useState(
    initialData?.description || 'Loading about info...'
  );
  const [portraitUrl, setPortraitUrl] = useState<string | null>(initialData?.portraitUrl || null);

  useEffect(() => {
    if (initialData) return;

    const fetchAbout = async () => {
      const data = await getAboutInfo();
      if (data) {
        setDescription(data.description || 'Welcome to the world of The Artist.');
        setPortraitUrl(data.portraitUrl);
      }
    };
    fetchAbout();
  }, [initialData]);

  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center py-20 bg-gradient-to-b from-black via-neutral-900 to-black text-white"
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start md:items-center">
        {/* Text Content (Left Side) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">About</h2>
          <div className="text-base md:text-lg text-gray-400 leading-relaxed font-sans whitespace-pre-wrap">
            {description}
          </div>
        </motion.div>

        {/* Portrait Image (Right Side) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-[3/4] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
        >
          {portraitUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={portraitUrl} alt="Artist Portrait" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              [Artist Portrait]
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

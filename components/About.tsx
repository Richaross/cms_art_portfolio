'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function About() {
  const [description, setDescription] = useState('Loading about info...');
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAbout = async () => {
      const { data } = await supabase.from('about_info').select('*').single();
      if (data) {
        setDescription(data.description || 'Welcome to the world of The Artist.');
        setPortraitUrl(data.portrait_url);
      }
    };
    fetchAbout();
  }, [supabase]);

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

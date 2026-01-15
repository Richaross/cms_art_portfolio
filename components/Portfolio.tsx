'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import { X, ShoppingBag } from 'lucide-react';

type Section = Database['public']['Tables']['sections']['Row'] & {
  inventory: Database['public']['Tables']['inventory']['Row'] | null;
};

export default function Portfolio() {
  // We update the type to include section_items
  type SectionWithItems = Section & {
    section_items: Database['public']['Tables']['section_items']['Row'][];
  };

  const [sections, setSections] = useState<SectionWithItems[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionWithItems | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showShopForItem, setShowShopForItem] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('*, inventory(*), section_items(*)') // Fetch Items
        .order('order_rank', { ascending: true })
        .order('order_rank', { foreignTable: 'section_items', ascending: true }); // Order items

      if (data) setSections(data as SectionWithItems[]);
    };
    fetchSections();
  }, [supabase]);

  return (
    <section
      id="portfolio"
      className="relative min-h-screen py-20 text-white bg-black overflow-hidden"
    >
      {/* Dynamic Blurred Background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <AnimatePresence mode="popLayout">
          {activeImage && (
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center blur-[100px] scale-125 saturate-150"
              style={{ backgroundImage: `url(${activeImage})` }}
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold mb-16 text-center tracking-tighter"
        >
          Portfolio
        </motion.h2>

        {/* Collections Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => {
                setSelectedSection(section);
                setShowShopForItem(null); // Reset shop when opening section
              }}
              onMouseEnter={() => setActiveImage(section.img_url)}
              className="break-inside-avoid group cursor-pointer"
            >
              {/* Collection Cover Image */}
              <div className="relative overflow-hidden rounded-lg bg-neutral-900 mb-4 aspect-[4/5]">
                {section.img_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={section.img_url}
                      alt={section.title || 'Collection'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    No Cover
                  </div>
                )}

                {/* Badge if items exist */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  {section.section_items?.length || 0} Items
                </div>
              </div>

              {/* Collection Details */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-gray-300 transition-colors">
                  {section.title || 'Untitled Collection'}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                    {section.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collection Detail Modal */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedSection(null)}
          >
            {/* Close Button (Top Right of screen) */}
            <button
              onClick={() => setSelectedSection(null)}
              className="fixed top-8 right-8 z-[110] p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white hover:rotate-90"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl h-full overflow-y-auto px-6 py-20 scroll-smooth no-scrollbar"
            >
              {/* Section Header */}
              <div className="mb-20 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">
                  {selectedSection.title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedSection.description}
                </p>
              </div>

              {/* Vertical Vertical Item List */}
              <div className="space-y-32 mb-20">
                {selectedSection.section_items?.map((item) => (
                  <div key={item.id} className="relative flex flex-col items-center group">
                    {/* Item Image (Full Size) */}
                    <div className="w-full max-w-4xl rounded-lg overflow-hidden bg-neutral-900 border border-white/5 relative">
                      {item.image_url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image_url}
                            alt={item.title || 'Artwork'}
                            className="w-full h-auto object-contain cursor-pointer transition-transform duration-700 hover:scale-[1.02]"
                            onClick={() => {
                              if (item.is_sale_active) {
                                setShowShopForItem(showShopForItem === item.id ? null : item.id);
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="aspect-video w-full flex items-center justify-center text-gray-700">
                          No Image
                        </div>
                      )}

                      {/* Sale/Archival Badge on Image */}
                      {!item.is_sale_active && (
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white/50 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-white/10">
                          Archival
                        </div>
                      )}
                    </div>

                    {/* Item Text Details Below */}
                    <div className="mt-8 text-center max-w-2xl w-full">
                      <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                      {item.description && (
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}

                      {/* Interaction Area */}
                      <div className="mt-6 flex justify-center">
                        {item.is_sale_active ? (
                          <button
                            onClick={() =>
                              setShowShopForItem(showShopForItem === item.id ? null : item.id)
                            }
                            className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white flex items-center gap-2 border-b border-white/20 pb-1 transition-all"
                          >
                            <ShoppingBag size={14} />
                            {showShopForItem === item.id ? 'Hide Details' : 'Purchase Details'}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 italic">
                            Part of Private Collection
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shop Window (Dropdown/Overlay) */}
                    <AnimatePresence>
                      {showShopForItem === item.id && item.is_sale_active && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -20, height: 0 }}
                          className="w-full max-w-md mt-6 overflow-hidden"
                        >
                          <div className="bg-white text-black p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-8 relative">
                            {/* Visual Indicator of Connection to Item */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />

                            <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400 block mb-1">
                                    Price
                                  </span>
                                  <span className="text-3xl font-black">${item.price}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400 block mb-1">
                                    Inventory
                                  </span>
                                  <span className="text-sm font-bold uppercase">
                                    {item.stock_qty} Available
                                  </span>
                                </div>
                              </div>

                              <a
                                href={item.stripe_link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all group active:scale-95"
                              >
                                <ShoppingBag size={18} />
                                Buy Original Illustration
                              </a>
                              <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-tight">
                                Secure Checkout Powered by Stripe
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {(!selectedSection.section_items || selectedSection.section_items.length === 0) && (
                <div className="text-center py-20 text-gray-500 italic">
                  <p>No items found in this collection.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

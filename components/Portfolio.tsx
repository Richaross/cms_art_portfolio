'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import { X, ShoppingBag } from 'lucide-react';

type Section = Database['public']['Tables']['sections']['Row'] & {
    inventory: Database['public']['Tables']['inventory']['Row'] | null
};

export default function Portfolio() {
    // We update the type to include section_items
    type SectionWithItems = Section & {
        section_items: Database['public']['Tables']['section_items']['Row'][];
    };

    const [sections, setSections] = useState<SectionWithItems[]>([]);
    const [selectedSection, setSelectedSection] = useState<SectionWithItems | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
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
        <section id="portfolio" className="relative min-h-screen py-20 text-white bg-black overflow-hidden">

            {/* Dynamic Blurred Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
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
                            onClick={() => setSelectedSection(section)}
                            onMouseEnter={() => setActiveImage(section.img_url)}
                            className="break-inside-avoid group cursor-pointer"
                        >
                            {/* Collection Cover Image */}
                            <div className="relative overflow-hidden rounded-lg bg-neutral-900 mb-4 aspect-[4/5]">
                                {section.img_url ? (
                                    <img
                                        src={section.img_url}
                                        alt={section.title || 'Collection'}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700">No Cover</div>
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
                                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                        onClick={() => setSelectedSection(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 text-white w-full max-w-7xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start shrink-0">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">{selectedSection.title}</h2>
                                    <p className="text-gray-400 max-w-2xl">{selectedSection.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSection(null)}
                                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Items Grid (Scrollable) */}
                            <div className="p-6 md:p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {selectedSection.section_items?.map((item) => (
                                        <div key={item.id} className="bg-black rounded-lg overflow-hidden border border-white/5 hover:border-white/20 transition-all group">
                                            {/* Item Image */}
                                            <div className="aspect-square bg-neutral-800 relative">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.title || 'Item'}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                                )}

                                                {/* Sale Badge */}
                                                {item.is_sale_active && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">
                                                        FOR SALE
                                                    </div>
                                                )}
                                            </div>

                                            {/* Item Details */}
                                            <div className="p-4 flex flex-col gap-2">
                                                <h4 className="font-bold text-lg truncate" title={item.title || ''}>{item.title}</h4>
                                                <p className="text-xs text-gray-400 line-clamp-2 h-8">{item.description}</p>

                                                {/* Buy / Price Area */}
                                                <div className="pt-2 mt-auto border-t border-white/10 flex items-center justify-between">
                                                    {item.is_sale_active ? (
                                                        <>
                                                            <span className="text-xl font-bold text-green-400">${item.price}</span>
                                                            <a
                                                                href={item.stripe_link || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${item.stripe_link
                                                                        ? 'bg-white text-black hover:bg-gray-200'
                                                                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                <ShoppingBag size={12} /> Buy
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Not for Sale</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {(!selectedSection.section_items || selectedSection.section_items.length === 0) && (
                                    <div className="text-center py-20 text-gray-500">
                                        <p>No items found in this collection.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

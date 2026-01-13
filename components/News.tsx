'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import { format } from 'date-fns';
import { X, ExternalLink, ArrowRight } from 'lucide-react';

type NewsPost = Database['public']['Tables']['news_posts']['Row'];

export default function News() {
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('news_posts')
                .select('*')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(50); // Fetch more to allow expansion
            if (data) setPosts(data);
        };
        fetchNews();
    }, [supabase]);

    const displayedPosts = showAll ? posts : posts.slice(0, 3);

    return (
        <section id="news" className="py-20 bg-gradient-to-b from-black to-neutral-900 text-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold tracking-tighter"
                    >
                        Latest News
                    </motion.h2>
                    {posts.length > 3 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm border-b border-transparent hover:border-white transition-all pb-1 hidden md:block"
                        >
                            {showAll ? 'Show Less' : 'View All Updates'}
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.length > 0 ? displayedPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => setSelectedPost(post)}
                            className="block group cursor-pointer"
                        >
                            {/* Card Content */}
                            <div className="relative aspect-[4/3] bg-neutral-800 rounded-lg overflow-hidden mb-6">
                                {post.image_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                )}

                                {post.category && (
                                    <div className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full">
                                        {post.category}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
                                </div>
                                <h3 className="text-xl font-bold group-hover:underline decoration-1 underline-offset-4">
                                    {post.title}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                                    {post.summary || post.content}
                                </p>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-3 text-center py-12 text-gray-500 border border-white/5 rounded">
                            No news updates yet.
                        </div>
                    )}
                </div>

                {/* Mobile View All Button */}
                {posts.length > 3 && (
                    <div className="mt-8 text-center md:hidden">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm border-b border-gray-500 hover:border-white transition-all pb-1"
                        >
                            {showAll ? 'Show Less' : 'View All Updates'}
                        </button>
                    </div>
                )}
            </div>

            {/* News Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPost(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-neutral-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl border border-white/10"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors text-white"
                            >
                                <X size={20} />
                            </button>

                            {/* Modal Image */}
                            {selectedPost.image_url && (
                                <div className="relative h-64 md:h-80 w-full bg-neutral-800">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={selectedPost.image_url}
                                        alt={selectedPost.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {selectedPost.category && (
                                        <div className="absolute bottom-4 left-4 bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">
                                            {selectedPost.category}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Modal Content */}
                            <div className="p-8 md:p-10 space-y-6">
                                <div>
                                    <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">
                                        {format(new Date(selectedPost.published_at || selectedPost.created_at), 'MMMM d, yyyy')}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                                        {selectedPost.title}
                                    </h2>
                                </div>

                                {/* Full Content */}
                                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedPost.content || selectedPost.summary}
                                </div>

                                {/* External Link Button */}
                                {selectedPost.external_link && (
                                    <div className="pt-6 border-t border-white/10">
                                        <a
                                            href={selectedPost.external_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            View Source <ExternalLink size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}

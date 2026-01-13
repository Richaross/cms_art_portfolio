import { Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingHero() {
    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
            {/* Background Image Placeholder */}
            <div
                className="absolute inset-0 z-0 opacity-50"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-black/80" />

            {/* Content */}
            <div className="relative z-20 flex flex-col items-center gap-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-bold tracking-tighter"
                >
                    Art Portfolio
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex gap-6 mt-4"
                >
                    <Link href="https://linkedin.com" target="_blank" className="hover:text-gray-300 transition-colors">
                        <Linkedin size={32} strokeWidth={1.5} />
                    </Link>
                    <Link href="https://instagram.com" target="_blank" className="hover:text-gray-300 transition-colors">
                        <Instagram size={32} strokeWidth={1.5} />
                    </Link>
                </motion.div>
            </div>
            {/* Bottom Fade for Smooth Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
        </div>
    );
}

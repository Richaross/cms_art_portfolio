'use client'

import Link from 'next/link';


export default function Navbar() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/50 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo / Home Link */}
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white hover:text-gray-300 transition-colors">
                    ArtPortfolio
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {['About', 'Portfolio', 'News'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {item}
                        </button>
                    ))}
                </div>

            </div>
        </nav>
    );
}

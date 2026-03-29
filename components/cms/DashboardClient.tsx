'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, LayoutGrid, User, Newspaper, ArrowLeft, Monitor } from 'lucide-react';
import Link from 'next/link';

import SectionList from '@/components/cms/SectionList';
import SectionEditor from '@/components/cms/SectionEditor';
import AboutEditor from '@/components/cms/AboutEditor';
import NewsEditor from '@/components/cms/NewsEditor';
import HeroEditor from '@/components/cms/HeroEditor';

import { PortfolioSection } from '@/app/domain/types';
import { getPortfolioSections } from '@/app/actions/portfolio';

const TABS = [
  { id: 'hero', label: 'Hero Section', icon: Monitor },
  { id: 'about', label: 'About', icon: User },
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
  { id: 'news', label: 'News', icon: Newspaper },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface DashboardClientProps {
  initialSections: PortfolioSection[];
}

export default function DashboardClient({ initialSections }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [sections, setSections] = useState<PortfolioSection[]>(initialSections);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null | undefined>(
    undefined
  );

  const router = useRouter();
  const supabase = createClient();

  const fetchData = async () => {
    const fresh = await getPortfolioSections();
    setSections(fresh);
    setEditingSection((prev) => {
      if (!prev) return prev;
      return fresh.find((s) => s.id === prev.id) ?? prev;
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-neutral-900/50">
        <div className="mb-8">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-4 transition-colors"
          >
            <ArrowLeft size={12} /> Back to Website
          </Link>
          <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Art Portfolio CMS
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingSection(undefined);
              }}
              className="relative w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors z-10"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={`relative z-20 flex items-center gap-3 ${activeTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <tab.icon size={18} />
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded text-sm text-red-500 hover:bg-red-500/10 transition-colors mt-auto"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 border-b border-white/10 pb-4">
            <h2 className="text-3xl font-bold capitalize">{activeTab} Manager</h2>
          </header>

          {activeTab === 'portfolio' && (
            <>
              {editingSection !== undefined ? (
                <SectionEditor
                  section={editingSection}
                  onSave={(shouldClose = true) => {
                    if (shouldClose) setEditingSection(undefined);
                    fetchData();
                  }}
                  onCancel={() => setEditingSection(undefined)}
                />
              ) : (
                <>
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 text-sm"
                    >
                      + Add Artwork
                    </button>
                  </div>
                  <SectionList
                    sections={sections}
                    onEdit={setEditingSection}
                    onRefresh={fetchData}
                  />
                </>
              )}
            </>
          )}

          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'about' && <AboutEditor />}
          {activeTab === 'news' && <NewsEditor />}
        </div>
      </main>
    </div>
  );
}

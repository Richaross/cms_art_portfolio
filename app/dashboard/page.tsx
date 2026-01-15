'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, LayoutGrid, User, Newspaper, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import SectionList from '@/components/cms/SectionList';
import SectionEditor from '@/components/cms/SectionEditor';
import AboutEditor from '@/components/cms/AboutEditor';
import NewsEditor from '@/components/cms/NewsEditor';

import { PortfolioSection } from '@/app/domain/types';
import { Database } from '@/types/database';

// Tabs Config
const TABS = [
  { id: 'portfolio', label: 'Portfolio', icon: LayoutGrid },
  { id: 'about', label: 'About', icon: User },
  { id: 'news', label: 'News', icon: Newspaper },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // 1. Auth Check & Data Fetch
  const fetchData = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    if (activeTab === 'portfolio') {
      const { data: sectionsData, error } = await supabase
        .from('sections')
        .select('*, inventory(*), section_items(*)')
        .order('order_rank', { ascending: true })
        .order('order_rank', { foreignTable: 'section_items', ascending: true });

      if (error) console.error('Error fetching sections:', error);
      else {
        // Define specific type for the join query result
        type SectionWithDetails = Database['public']['Tables']['sections']['Row'] & {
          inventory: Database['public']['Tables']['inventory']['Row'][] | null;
          section_items: Database['public']['Tables']['section_items']['Row'][] | null;
        };

        const mapped: PortfolioSection[] = ((sectionsData as SectionWithDetails[]) || []).map(
          (s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            imgUrl: s.img_url,
            orderRank: s.order_rank,
            inventory: s.inventory?.[0]
              ? {
                  sectionId: s.inventory[0].section_id,
                  stockQty: s.inventory[0].stock_qty,
                  price: s.inventory[0].price,
                  stripeLink: s.inventory[0].stripe_link,
                  isSaleActive: s.inventory[0].is_sale_active,
                }
              : null,
            items: (s.section_items || []).map((item) => ({
              id: item.id,
              sectionId: item.section_id,
              title: item.title || 'Untitled',
              description: item.description,
              imageUrl: item.image_url,
              price: item.price || 0,
              stockQty: item.stock_qty || 0,
              stripeLink: item.stripe_link,
              isSaleActive: item.is_sale_active || false,
              orderRank: item.order_rank || 0,
            })),
          })
        );
        setSections(mapped);
      }
    }

    setLoading(false);
  }, [activeTab, router, supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-8 text-white">Loading CMS...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar / Tabs */}
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

          {/* Tab Content */}
          {activeTab === 'portfolio' && (
            <>
              {editingSection !== undefined ? (
                <SectionEditor
                  section={editingSection}
                  onSave={() => {
                    setEditingSection(undefined);
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

          {activeTab === 'about' && <AboutEditor />}

          {activeTab === 'news' && <NewsEditor />}
        </div>
      </main>
    </div>
  );
}

'use client'

import { Database } from '@/types/database';

type Section = Database['public']['Tables']['sections']['Row'] & {
    inventory: Database['public']['Tables']['inventory']['Row'] | null
};

interface SectionListProps {
    sections: Section[];
    onEdit: (section: Section) => void;
    onRefresh: () => void;
}

export default function SectionList({ sections, onEdit }: SectionListProps) {
    if (sections.length === 0) {
        return <div className="text-gray-500">No sections found. Create one to get started.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section) => (
                <div
                    key={section.id}
                    className="border border-white/10 rounded-lg p-4 bg-neutral-900 cursor-pointer hover:border-white/30 transition-colors"
                    onClick={() => onEdit(section)}
                >
                    {section.img_url && (
                        <div className="aspect-video w-full mb-4 bg-gray-800 rounded overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={section.img_url} alt={section.title || 'Artwork'} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h3 className="font-bold text-lg text-white">{section.title || 'Untitled'}</h3>
                    <div
                        className="w-full h-2 mt-2 rounded"
                        style={{ backgroundColor: section.bg_color || '#333' }}
                    />
                    <div className="mt-2 text-xs text-gray-400">
                        {section.inventory?.is_sale_active ? (
                            <span className="text-green-400 font-bold">SALE ACTIVE (${section.inventory.price})</span>
                        ) : (
                            <span>Not for sale</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

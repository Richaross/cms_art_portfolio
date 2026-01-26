'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { PortfolioSection } from '@/app/domain/types';

interface SortableSectionItemProps {
  section: PortfolioSection;
  onEdit: (section: PortfolioSection) => void;
}

export function SortableSectionItem({ section, onEdit }: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border border-white/10 rounded-lg bg-neutral-900 group ${
        isDragging ? 'border-blue-500 shadow-lg' : 'hover:border-white/30'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-2 bg-black/50 rounded flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors z-20"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Content Area - Click to Edit */}
      <div onClick={() => onEdit(section)} className="p-4 cursor-pointer h-full flex flex-col">
        {section.imgUrl && (
          <div className="aspect-video w-full mb-4 bg-gray-800 rounded overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={section.imgUrl}
              alt={section.title || 'Artwork'}
              className="w-full h-full object-cover pointer-events-none" // prevent image drag interfering with dnd
            />
          </div>
        )}
        <h3 className="font-bold text-lg text-white mb-1 select-none">
          {section.title || 'Untitled'}
        </h3>
        <div className="mt-2 text-xs text-gray-400 select-none">
          {section.inventory?.isSaleActive ? (
            <span className="text-green-400 font-bold">
              SALE ACTIVE (${section.inventory.price})
            </span>
          ) : (
            <span>Not for sale</span>
          )}
        </div>
        {!section.isPublished && (
          <span className="mt-auto inline-block text-[10px] uppercase font-bold text-yellow-500 pt-2">
            Draft
          </span>
        )}
      </div>
    </div>
  );
}

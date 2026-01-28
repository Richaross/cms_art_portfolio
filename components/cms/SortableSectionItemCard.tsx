'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2 } from 'lucide-react';
import { SectionItem } from '@/app/domain/types';

interface SortableSectionItemCardProps {
  item: SectionItem;
  onEdit: (item: SectionItem) => void;
  selected?: boolean;
  onSelect?: () => void;
}

export function SortableSectionItemCard({
  item,
  onEdit,
  selected,
  onSelect,
}: SortableSectionItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
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
      className={`relative group bg-black/50 rounded border transition-all overflow-hidden flex flex-col ${
        selected ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-900/10' : 'border-white/5'
      } ${isDragging ? 'border-blue-500 shadow-lg' : 'hover:border-white/20'}`}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div
          className={`absolute top-2 right-2 z-30 transition-opacity ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="w-4 h-4 cursor-pointer accent-blue-500"
          />
        </div>
      )}

      {/* Image Area */}
      <div className="aspect-square w-full bg-neutral-800 relative">
        {item.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover pointer-events-none"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
            title="Edit Item"
          >
            <Edit2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col gap-1">
        <div className="font-medium text-sm truncate select-none" title={item.title}>
          {item.title}
        </div>
        <div className="text-xs text-gray-400 flex justify-between items-center select-none">
          {item.isSaleActive ? (
            <span className="text-green-400 font-mono">${item.price}</span>
          ) : (
            <span className="text-gray-600">Hidden</span>
          )}
          <span className="text-gray-600">Qty: {item.stockQty}</span>
        </div>
        {!item.isPublished && (
          <span className="text-[10px] uppercase font-bold text-yellow-500 select-none">Draft</span>
        )}
      </div>

      {/* Drag Handle */}
      {/* Using separate handle to avoid blocking clicks on the rest of the card */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab opacity-0 group-hover:opacity-100 bg-black/50 p-1.5 rounded hover:bg-black/70 active:cursor-grabbing transition-opacity z-20"
      >
        <GripVertical size={14} className="text-white/80" />
      </div>
    </div>
  );
}

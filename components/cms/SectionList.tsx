'use client';

import { useState, useEffect } from 'react';
import { PortfolioSection } from '@/app/domain/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSectionItem } from './SortableSectionItem';
import { reorderSections } from '@/app/actions/portfolio';
import { ArrowDownAZ, ArrowUpZA, CalendarArrowDown, CalendarArrowUp } from 'lucide-react';

interface SectionListProps {
  sections: PortfolioSection[];
  onEdit: (section: PortfolioSection) => void;
  onRefresh: () => void;
}

export default function SectionList({
  sections: initialSections,
  onEdit,
  onRefresh,
}: SectionListProps) {
  const [items, setItems] = useState<PortfolioSection[]>(initialSections);

  useEffect(() => {
    setItems(initialSections);
  }, [initialSections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);

      // Optimistic Update
      setItems(newOrder);

      const updates = newOrder.map((item, index) => ({
        id: item.id,
        orderRank: index,
      }));

      // Fire and forget (or handle error via toast)
      reorderSections(updates).catch((err) => {
        console.error('Reorder failed', err);
        onRefresh(); // Pull authoritative order from server
      });
    }
  }

  const handleQuickSort = (type: 'newest' | 'oldest' | 'az' | 'za') => {
    const sorted = [...items].sort((a, b) => {
      switch (type) {
        case 'newest':
          // Using createdAt would be better but we only have publishedAt or ID or implicit insertion order
          // Let's use publishedAt if available, else strict ID comparison?
          // Or just CreatedAt if we had it. We removed createdAt from types earlier?
          // Let's check definitions. publishedAt is nullable.
          // Fallback to ID for stable sort?
          return (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0);
        case 'oldest':
          return (a.publishedAt?.getTime() || 0) - (b.publishedAt?.getTime() || 0);
        case 'az':
          return (a.title || '').localeCompare(b.title || '');
        case 'za':
          return (b.title || '').localeCompare(a.title || '');
        default:
          return 0;
      }
    });

    setItems(sorted);

    // Save the new order immediately
    const updates = sorted.map((item, index) => ({
      id: item.id,
      orderRank: index,
    }));
    reorderSections(updates).catch((err) => {
      console.error('Quick sort save failed', err);
      onRefresh();
    });
  };

  if (items.length === 0) {
    return <div className="text-gray-500">No sections found. Create one to get started.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Quick Sort Toolbar */}
      <div className="flex items-center justify-end gap-2 p-2 bg-neutral-900/50 rounded border border-white/5">
        <span className="text-xs text-gray-400 font-bold uppercase mr-2">Quick Sort:</span>
        <button
          onClick={() => handleQuickSort('newest')}
          className="p-1.5 hover:bg-white/10 rounded"
          title="Newest First"
        >
          <CalendarArrowDown size={14} />
        </button>
        <button
          onClick={() => handleQuickSort('oldest')}
          className="p-1.5 hover:bg-white/10 rounded"
          title="Oldest First"
        >
          <CalendarArrowUp size={14} />
        </button>
        <button
          onClick={() => handleQuickSort('az')}
          className="p-1.5 hover:bg-white/10 rounded"
          title="A-Z"
        >
          <ArrowDownAZ size={14} />
        </button>
        <button
          onClick={() => handleQuickSort('za')}
          className="p-1.5 hover:bg-white/10 rounded"
          title="Z-A"
        >
          <ArrowUpZA size={14} />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((section) => (
              <SortableSectionItem key={section.id} section={section} onEdit={onEdit} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

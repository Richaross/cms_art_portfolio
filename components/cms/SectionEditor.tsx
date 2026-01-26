'use client';

import { useState, useEffect } from 'react';
import { PortfolioSection, SectionItem } from '@/app/domain/types';
import ImageUploader from './ImageUploader';
import ItemEditor from './ItemEditor';
import RichTextEditor from './RichTextEditor';
import { saveSection, deleteSection, reorderItems } from '@/app/actions/portfolio';
import { Plus, ArrowDownAZ, ArrowUpZA, CalendarArrowDown, CalendarArrowUp } from 'lucide-react';
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
import { SortableSectionItemCard } from './SortableSectionItemCard';

interface SectionEditorProps {
  section: PortfolioSection | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');

  // Section (Collection) State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);

  // Item Editing State
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  // Items State (for Optimistic DnD)
  const [items, setItems] = useState<SectionItem[]>([]);

  // Initialize form when section prop changes
  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setDescription(section.description || '');
      setImgUrl(section.imgUrl || '');
      setIsPublished(section.isPublished ?? true);
      setPublishedAt(section.publishedAt || null);
      setItems(section.items || []);
    } else {
      setTitle('');
      setDescription('');
      setImgUrl('');
      setIsPublished(true);
      setPublishedAt(null);
      setItems([]);
    }
  }, [section]);

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
        sectionId: section?.id || '', // Required by action signature
        orderRank: index,
      }));

      reorderItems(updates).catch((err) => {
        console.error('Reorder failed', err);
        setItems(items); // Revert to original
        alert('Failed to save order. Please refresh.');
      });
    }
  }

  const handleQuickSort = (
    type: 'newest' | 'oldest' | 'az' | 'za' | 'price_high' | 'price_low'
  ) => {
    const sorted = [...items].sort((a, b) => {
      switch (type) {
        case 'newest':
          return (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0);
        case 'oldest':
          return (a.publishedAt?.getTime() || 0) - (b.publishedAt?.getTime() || 0);
        case 'az':
          return (a.title || '').localeCompare(b.title || '');
        case 'za':
          return (b.title || '').localeCompare(a.title || '');
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

    setItems(sorted);

    // Save
    const updates = sorted.map((item, index) => ({
      id: item.id,
      sectionId: section?.id || '',
      orderRank: index,
    }));
    reorderItems(updates).catch(console.error);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sectionData: Partial<PortfolioSection> = {
        title,
        description,
        imgUrl,
        isPublished,
        publishedAt: isPublished ? publishedAt || new Date() : null,
        orderRank: section?.orderRank || 0,
        ...(section?.id ? { id: section.id } : {}),
      };

      const result = await saveSection(sectionData);

      if (!result.success) {
        alert('Error saving collection: ' + result.error);
      } else {
        onSave(); // Refresh
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving collection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (
      !section?.id ||
      !confirm('Are you sure you want to delete this entire collection and all its items?')
    )
      return;
    setLoading(true);

    const result = await deleteSection(section.id, section.imgUrl);

    if (!result.success) {
      alert('Error deleting collection: ' + result.error);
      setLoading(false);
    } else {
      onSave();
    }
  };

  // --- Item Management Handlers ---

  const handleEditItem = (item: SectionItem) => {
    setEditingItem(item);
    setIsCreatingItem(false);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    setIsCreatingItem(true);
  };

  const closeItemEditor = () => {
    setEditingItem(null);
    setIsCreatingItem(false);
    onSave(); // Refresh parent to see new/updated items
  };

  // If we are editing an item, show the ItemEditor instead of the Section form
  if (editingItem || isCreatingItem) {
    return (
      <ItemEditor
        item={editingItem}
        sectionId={section?.id || ''} // New items require a saved section ID
        onSave={closeItemEditor}
        onCancel={() => {
          setEditingItem(null);
          setIsCreatingItem(false);
        }}
      />
    );
  }

  return (
    <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{section ? 'Edit Collection' : 'New Collection'}</h2>
        <div className="space-x-4">
          {!section?.id && (
            <span className="text-xs text-yellow-500">Save collection to add items</span>
          )}
          <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white">
            Close
          </button>
        </div>
      </div>

      {/* Tabs (Only if section exists) */}
      {section?.id && (
        <div className="flex gap-4 border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-white text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-2 px-2 text-sm font-medium ${activeTab === 'items' ? 'border-b-2 border-white text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Collection Items ({items.length})
          </button>
        </div>
      )}

      {activeTab === 'details' ? (
        <form onSubmit={handleSaveSection} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Collection Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded p-2"
                required={true}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>

            <ImageUploader label="Cover Image" value={imgUrl} onChange={setImgUrl} />

            <div className="flex flex-col gap-4 p-4 bg-black/30 rounded border border-white/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded bg-black/50 border-white/10 text-white accent-white"
                />
                <span className="text-sm font-medium">Published on site</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {section?.id && (
              <button
                type="button"
                onClick={handleDeleteSection}
                className="text-red-500 text-sm hover:underline"
              >
                Delete Collection
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 disabled:opacity-50 ml-auto"
            >
              {loading ? 'Saving...' : 'Save Collection'}
            </button>
          </div>
        </form>
      ) : (
        // Items Tab
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center bg-black/30 p-4 rounded border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase mr-2">Quick Sort:</span>
              <button
                onClick={() => handleQuickSort('newest')}
                className="p-1.5 hover:bg-white/10 rounded"
                title="Newest"
              >
                <CalendarArrowDown size={14} />
              </button>
              <button
                onClick={() => handleQuickSort('oldest')}
                className="p-1.5 hover:bg-white/10 rounded"
                title="Oldest"
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
              <span className="text-xs text-gray-500 mx-1">|</span>
              <button
                onClick={() => handleQuickSort('price_high')}
                className="p-1.5 hover:bg-white/10 rounded text-xs px-2 font-mono"
                title="Price High-Low"
              >
                $$$
              </button>
              <button
                onClick={() => handleQuickSort('price_low')}
                className="p-1.5 hover:bg-white/10 rounded text-xs px-2 font-mono"
                title="Price Low-High"
              >
                $
              </button>
            </div>
            <button
              onClick={handleCreateItem}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 ml-auto"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.length > 0 ? (
                  items.map((item) => (
                    <SortableSectionItemCard key={item.id} item={item} onEdit={handleEditItem} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500 italic border-2 border-dashed border-white/10 rounded">
                    <p>
                      No items found in this collection. Click &quot;Add Item&quot; to get started.
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

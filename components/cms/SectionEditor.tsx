'use client';

import { useState, useEffect } from 'react';
import { PortfolioSection, SectionItem } from '@/app/domain/types';
import ImageUploader from './ImageUploader';
import ItemEditor from './ItemEditor';
import RichTextEditor from './RichTextEditor';
import {
  saveSection,
  deleteSection,
  reorderItems,
  deleteSectionItemsAction,
  updateSectionItemsAction,
} from '@/app/actions/portfolio';
import {
  Plus,
  ArrowDownAZ,
  ArrowUpZA,
  CalendarArrowDown,
  CalendarArrowUp,
  Trash2,
  DollarSign,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
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
import toast from 'react-hot-toast';
import ConfirmDialog from './ConfirmDialog';

interface SectionEditorProps {
  section: PortfolioSection | null;
  onSave: (shouldClose?: boolean) => void;
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

  // Bulk Selection State
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [showBulkPriceDialog, setShowBulkPriceDialog] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [bulkSaleStatus, setBulkSaleStatus] = useState<'keep' | 'active' | 'inactive'>('keep');
  const [showDeleteSectionConfirm, setShowDeleteSectionConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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
        toast.error('Failed to save order. Please refresh.');
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
        toast.error(result.error || 'Failed to save collection.');
      } else {
        onSave(true);
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save collection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!section?.id) return;
    setLoading(true);

    const result = await deleteSection(section.id, section.imgUrl);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete collection.');
      setLoading(false);
    } else {
      onSave(true);
    }
  };

  // --- Bulk Actions Handlers ---

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItemIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    const itemsToDelete = items
      .filter((i) => selectedItemIds.has(i.id))
      .map((i) => ({ id: i.id, imgUrl: i.imageUrl }));

    const result = await deleteSectionItemsAction(itemsToDelete);

    if (result.success) {
      setSelectedItemIds(new Set());
      // Optimistic update could happen here, but simpler to rely on parent refresh or just filter locally
      const remaining = items.filter((i) => !selectedItemIds.has(i.id));
      setItems(remaining);
      // Also trigger full refresh to be safe, but DON'T CLOSE
      onSave(false);
    } else {
      toast.error(result.error || 'Bulk delete failed.');
    }
    setLoading(false);
  };

  const handleBulkUpdate = async () => {
    setLoading(true);
    const updates: Partial<SectionItem> = {};
    if (bulkPrice !== '') {
      updates.price = parseFloat(bulkPrice);
    }
    if (bulkSaleStatus !== 'keep') {
      updates.isSaleActive = bulkSaleStatus === 'active';
    }

    if (Object.keys(updates).length === 0) {
      setShowBulkPriceDialog(false);
      setLoading(false);
      return;
    }

    const result = await updateSectionItemsAction(Array.from(selectedItemIds), updates);

    if (result.success) {
      setShowBulkPriceDialog(false);
      setSelectedItemIds(new Set());
      onSave(false); // Refresh but DON'T CLOSE
    } else {
      toast.error(result.error || 'Bulk update failed.');
    }
    setLoading(false);
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
    onSave(false); // Refresh parent to see new/updated items, but DON'T CLOSE section editor
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

          {showDeleteSectionConfirm && (
            <ConfirmDialog
              message="Are you sure you want to delete this entire collection and all its items? This cannot be undone."
              confirmLabel="Delete Collection"
              destructive
              onConfirm={() => {
                setShowDeleteSectionConfirm(false);
                handleDeleteSection();
              }}
              onCancel={() => setShowDeleteSectionConfirm(false)}
            />
          )}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {section?.id && (
              <button
                type="button"
                onClick={() => setShowDeleteSectionConfirm(true)}
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
        <div className="space-y-4 relative">
          {/* Bulk Action / Quick Sort Header */}
          {selectedItemIds.size > 0 ? (
            <div className="flex flex-wrap gap-2 justify-between items-center bg-blue-900/30 border border-blue-500/50 p-4 rounded">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                >
                  {selectedItemIds.size === items.length ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  Select All
                </button>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="font-bold text-white text-sm">
                  {selectedItemIds.size} Selected
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkPriceDialog(true)}
                  className="flex items-center gap-2 bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600"
                >
                  <DollarSign size={14} /> Update
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-red-700 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
                >
                  <Trash2 size={14} /> Delete
                </button>
                {showBulkDeleteConfirm && (
                  <ConfirmDialog
                    message={`Are you sure you want to delete ${selectedItemIds.size} items? This cannot be undone.`}
                    confirmLabel="Delete Items"
                    destructive
                    onConfirm={() => {
                      setShowBulkDeleteConfirm(false);
                      handleBulkDelete();
                    }}
                    onCancel={() => setShowBulkDeleteConfirm(false)}
                  />
                )}
                <button
                  onClick={() => setSelectedItemIds(new Set())}
                  className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                  title="Clear Selection"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-between items-center bg-black/30 p-4 rounded border border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="p-1.5 text-gray-400 hover:text-white mr-2"
                  title="Select All"
                >
                  <Square size={16} />
                </button>
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
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.length > 0 ? (
                  items.map((item) => (
                    <SortableSectionItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditItem}
                      selected={selectedItemIds.has(item.id)}
                      onSelect={() => handleToggleSelect(item.id)}
                    />
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

      {showBulkPriceDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-white/20 p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Update {selectedItemIds.size} Items</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Leave empty to keep current price"
                  className="w-full bg-black/50 border border-white/10 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sale Status</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBulkSaleStatus('keep')}
                    className={`flex-1 py-2 rounded text-sm border ${
                      bulkSaleStatus === 'keep'
                        ? 'bg-white text-black border-white'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    No Change
                  </button>
                  <button
                    onClick={() => setBulkSaleStatus('active')}
                    className={`flex-1 py-2 rounded text-sm border ${
                      bulkSaleStatus === 'active'
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    On Sale
                  </button>
                  <button
                    onClick={() => setBulkSaleStatus('inactive')}
                    className={`flex-1 py-2 rounded text-sm border ${
                      bulkSaleStatus === 'inactive'
                        ? 'bg-gray-600 border-gray-600 text-white'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowBulkPriceDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client'

import { useState, useEffect } from 'react';
import { PortfolioSection, SectionItem } from '@/app/domain/types';
import ImageUploader from './ImageUploader';
import ItemEditor from './ItemEditor';
import { saveSection, deleteSection } from '@/app/actions/portfolio';
import { Plus, Edit2, Archive, GripVertical } from 'lucide-react'; // Assuming lucide-react is available

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

    // Item Editing State
    const [editingItem, setEditingItem] = useState<SectionItem | null>(null);
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    // Initialize form when section prop changes
    useEffect(() => {
        if (section) {
            setTitle(section.title || '');
            setDescription(section.description || '');
            setImgUrl(section.imgUrl || '');
        } else {
            setTitle('');
            setDescription('');
            setImgUrl('');
        }
    }, [section]);

    const handleSaveSection = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const sectionData: Partial<PortfolioSection> = {
                title,
                description,
                imgUrl,
                orderRank: section?.orderRank || 0,
                ...(section?.id ? { id: section.id } : {})
            };

            // We don't pass inventory anymore here, as we are moving to Items.
            // But to preserve backward compatibility if needed, we could pass null or existing.
            // For now, let's just save the section metadata.
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
        if (!section?.id || !confirm('Are you sure you want to delete this entire collection and all its items?')) return;
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
                onCancel={() => { setEditingItem(null); setIsCreatingItem(false); }}
            />
        );
    }

    return (
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{section ? 'Edit Collection' : 'New Collection'}</h2>
                <div className="space-x-4">
                    {!section?.id && <span className="text-xs text-yellow-500">Save collection to add items</span>}
                    <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white">Close</button>
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
                        Collection Items ({section.items?.length || 0})
                    </button>
                </div>
            )}

            {activeTab === 'details' ? (
                <form onSubmit={handleSaveSection} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Collection Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded p-2"
                                required={true}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded p-2 h-24"
                            />
                        </div>

                        <ImageUploader
                            label="Cover Image"
                            value={imgUrl}
                            onChange={setImgUrl}
                        />
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
                    <div className="flex justify-between items-center bg-black/30 p-4 rounded border border-white/5">
                        <p className="text-sm text-gray-400">Manage individual artworks/products in this collection.</p>
                        <button
                            onClick={handleCreateItem}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {section?.items && section.items.length > 0 ? (
                            section.items.map((item) => (
                                <div key={item.id} className="relative group bg-black/50 rounded border border-white/5 hover:border-white/20 transition-all overflow-hidden flex flex-col">
                                    {/* Image Area */}
                                    <div className="aspect-square w-full bg-neutral-800 relative">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                                        )}

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEditItem(item)}
                                                className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
                                                title="Edit Item"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-3 flex flex-col gap-1">
                                        <div className="font-medium text-sm truncate" title={item.title}>{item.title}</div>
                                        <div className="text-xs text-gray-400 flex justify-between items-center">
                                            {item.isSaleActive ? (
                                                <span className="text-green-400 font-mono">${item.price}</span>
                                            ) : (
                                                <span className="text-gray-600">Hidden</span>
                                            )}
                                            <span className="text-gray-600">Qty: {item.stockQty}</span>
                                        </div>
                                    </div>

                                    {/* Drag Handle */}
                                    <div className="absolute top-2 left-2 cursor-grab opacity-0 group-hover:opacity-100 bg-black/50 p-1 rounded">
                                        <GripVertical size={14} className="text-white/70" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500 italic border-2 border-dashed border-white/10 rounded">
                                No items in this collection yet. Click "Add Item" to start.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

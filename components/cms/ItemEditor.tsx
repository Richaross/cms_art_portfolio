'use client'

import { useState, useEffect } from 'react';
import { SectionItem } from '@/app/domain/types';
import ImageUploader from './ImageUploader';
import { saveItem, deleteItem } from '@/app/actions/portfolio';

interface ItemEditorProps {
    item: SectionItem | null;
    sectionId: string;
    onSave: () => void;
    onCancel: () => void;
}

export default function ItemEditor({ item, sectionId, onSave, onCancel }: ItemEditorProps) {
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaleActive, setIsSaleActive] = useState(false);
    const [price, setPrice] = useState('0');
    const [stock, setStock] = useState('1');
    const [stripeLink, setStripeLink] = useState('');

    useEffect(() => {
        if (item) {
            setTitle(item.title || '');
            setDescription(item.description || '');
            setImageUrl(item.imageUrl || '');
            setIsSaleActive(item.isSaleActive || false);
            setPrice(item.price?.toString() || '0');
            setStock(item.stockQty?.toString() || '1');
            setStripeLink(item.stripeLink || '');
        } else {
            setTitle('');
            setDescription('');
            setImageUrl('');
            setIsSaleActive(false);
            setPrice('0');
            setStock('1');
            setStripeLink('');
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const itemData: SectionItem = {
                id: item?.id || '', // Empty for new
                sectionId: sectionId,
                title,
                description,
                imageUrl,
                isSaleActive,
                price: parseFloat(price) || 0,
                stockQty: parseInt(stock) || 0,
                stripeLink,
                orderRank: item?.orderRank || 0
            };

            const result = await saveItem(itemData);

            if (!result.success) {
                alert('Error saving item: ' + result.error);
            } else {
                onSave();
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!item?.id || !confirm('Are you sure you want to delete this item?')) return;
        setLoading(true);

        const result = await deleteItem(item.id, item.imageUrl);

        if (!result.success) {
            alert('Error deleting item: ' + result.error);
            setLoading(false);
        } else {
            onSave();
        }
    };

    return (
        <div className="bg-neutral-800 border border-white/20 p-6 rounded-lg my-4">
            <h3 className="text-lg font-bold mb-4">{item ? 'Edit Item' : 'New Item'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded p-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 h-20"
                    />
                </div>

                <ImageUploader
                    label="Item Image"
                    value={imageUrl}
                    onChange={setImageUrl}
                />

                {/* Sale Settings */}
                <div className="border-t border-white/10 pt-4 mt-4">
                     <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                            type="checkbox"
                            checked={isSaleActive}
                            onChange={e => setIsSaleActive(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-700 text-white"
                        />
                        <span className="text-sm font-bold">For Sale</span>
                    </label>

                    {isSaleActive && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Stock</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={e => setStock(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Stripe Link</label>
                                <input
                                    type="text"
                                    value={stripeLink}
                                    onChange={e => setStripeLink(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded p-2"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div>
                        {item?.id && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 rounded border border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white font-bold px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Item'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

'use client'

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { getAboutInfo, saveAboutInfo } from '@/app/actions/about';

export default function AboutEditor() {
    const [description, setDescription] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAbout = async () => {
            const data = await getAboutInfo();
            if (data) {
                setDescription(data.description || '');
                setPortraitUrl(data.portraitUrl || '');
            }
        };
        fetchAbout();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await saveAboutInfo({ id: 1, description, portraitUrl });

        setLoading(false);
        if (!result.success) {
            alert('Error updating About info: ' + result.error);
        } else {
            alert('About info updated!');
        }
    };

    return (
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Edit "About" Section</h2>
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Artist Bio (Rich Text)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded p-4 h-64 text-sm leading-relaxed"
                        placeholder="Write your story here..."
                    />
                </div>


                <div>
                    <ImageUploader
                        label="Portrait Image"
                        value={portraitUrl}
                        onChange={setPortraitUrl}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}

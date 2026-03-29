'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ImageUploader from './ImageUploader';
import { getAboutInfo, saveAboutInfo } from '@/app/actions/about';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AboutEditor() {
  const [description, setDescription] = useState('');
  const [portraitUrl, setPortraitUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAbout = async () => {
      const data = await getAboutInfo();
      if (data) {
        setDescription(data.description || '');
        setPortraitUrl(data.portraitUrl || '');
        setIsPublished(data.isPublished ?? true);
        setPublishedAt(data.publishedAt);
      }
    };
    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await saveAboutInfo({
      id: 1,
      description,
      portraitUrl,
      isPublished,
      publishedAt: isPublished ? publishedAt || new Date() : null,
    });

    setLoading(false);
    if (!result.success) {
      toast.error(result.error || 'Failed to update About info.');
    } else {
      toast.success('About info updated!');
    }
  };

  return (
    <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Edit &quot;About&quot; Section</h2>
      <p className="text-sm text-gray-400 mb-6">
        Manage the content for the &quot;About&quot; section.
      </p>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Artist Bio</label>
          <RichTextEditor content={description} onChange={setDescription} />
        </div>

        <div>
          <ImageUploader label="Portrait Image" value={portraitUrl} onChange={setPortraitUrl} />
        </div>

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
          {isPublished && publishedAt && (
            <div className="text-xs text-gray-500 italic">Since {format(publishedAt, 'PPP')}</div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

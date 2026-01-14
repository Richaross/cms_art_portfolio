'use client'

import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import ImageUploader from './ImageUploader';
import { createClient } from '@/lib/supabase/client';
import { getNewsPosts, saveNewsPost, deleteNewsPost } from '@/app/actions/news';
import { NewsPost } from '@/app/domain/types';

export default function NewsEditor() {
    const supabase = createClient();
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [editingPost, setEditingPost] = useState<NewsPost | null | undefined>(undefined);
    // undefined=list, null=new, object=edit

    const fetchPosts = async () => {
        const data = await getNewsPosts();
        setPosts(data);
    };

    useEffect(() => {
        const fetchPosts = async () => {
            const { data } = await supabase
                .from('news_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setPosts(data);
        };
        fetchPosts();
    }, [supabase]);

    if (editingPost !== undefined) {
        return (
            <NewsPostForm
                post={editingPost}
                onSave={() => {
                    setEditingPost(undefined);
                    fetchPosts();
                }}
                onCancel={() => setEditingPost(undefined)}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">News Posts</h2>
                <button
                    onClick={() => setEditingPost(null)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200 text-sm"
                >
                    <Plus size={16} /> New Post
                </button>
            </div>

            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-neutral-900 p-4 rounded border border-white/10 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">{post.title}</h3>
                            <div className="text-xs text-gray-500 mt-1">
                                {post.isPublished ? 'Published' : 'Draft'} • {format(new Date(post.publishedAt || post.createdAt), 'MMM d, yyyy')}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingPost(post)}
                                className="p-2 hover:bg-white/10 rounded"
                            >
                                <Edit size={16} className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && <div className="text-gray-500">No news posts yet.</div>}
            </div>
        </div>
    );
}

// Inner Form Component
function NewsPostForm({ post, onSave, onCancel }: { post: NewsPost | null, onSave: () => void, onCancel: () => void }) {
    const [title, setTitle] = useState(post?.title || '');
    const [summary, setSummary] = useState(post?.summary || '');
    const [category, setCategory] = useState(post?.category || 'General');
    const [content, setContent] = useState(post?.content || '');
    const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
    const [externalLink, setExternalLink] = useState(post?.externalLink || '');
    const [isPublished, setIsPublished] = useState(post?.isPublished ?? true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const postData: Partial<NewsPost> = {
            title,
            summary,
            category,
            content,
            imageUrl,
            externalLink,
            isPublished,
            publishedAt: isPublished ? (post?.publishedAt || new Date()) : null,
            ...(post?.id ? { id: post.id } : {})
        };

        const result = await saveNewsPost(postData);

        setLoading(false);
        if (!result.success) {
            alert('Error saving post: ' + result.error);
        } else {
            onSave();
        }
    };

    const handleDelete = async () => {
        if (!post?.id || !confirm('Delete this post?')) return;
        setLoading(true);

        const result = await deleteNewsPost(post.id, post.imageUrl);

        if (!result.success) {
            alert('Error deleting post: ' + result.error);
            setLoading(false);
        } else {
            onSave();
        }
    };

    return (
        <div className="bg-neutral-900 border border-white/10 p-6 rounded-lg max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{post ? 'Edit Post' : 'New Post'}</h2>
                <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                        >
                            <option value="General">General</option>
                            <option value="Exhibition">Exhibition</option>
                            <option value="Press">Press</option>
                            <option value="Journal">Journal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">External Link (Optional)</label>
                        <input
                            type="text"
                            value={externalLink}
                            onChange={e => setExternalLink(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-black/50 border border-white/10 rounded p-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Summary (Short)</label>
                    <textarea
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 h-20 text-sm"
                        placeholder="A brief teaser for the card view..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Main Content</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded p-2 h-32"
                    />
                </div>


                <div>
                    <ImageUploader
                        label="News Image"
                        value={imageUrl}
                        onChange={setImageUrl}
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={e => setIsPublished(e.target.checked)}
                        className="rounded bg-black/50 border-white/10"
                    />
                    <span className="text-sm">Published</span>
                </label>

                <div className="flex items-center justify-between pt-4">
                    {post?.id && (
                        <button type="button" onClick={handleDelete} className="text-red-500 text-sm hover:underline flex items-center gap-1">
                            <Trash2 size={14} /> Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-gray-200 ml-auto"
                    >
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}

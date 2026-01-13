'use client'

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUploader({ value, onChange, label = "Image" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (!cloudName) throw new Error('Cloudinary Cloud Name is missing');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            const data = await response.json();
            if (data.secure_url) {
                onChange(data.secure_url);
            } else {
                throw new Error(data.error?.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Check console for details.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>

            {value ? (
                <div className="relative aspect-video bg-neutral-800 rounded-lg overflow-hidden border border-white/10 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        title="Remove Image"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative group">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin mb-3 text-blue-400" size={32} />
                                    <p className="text-sm text-gray-400 font-medium">Optimizing & Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:bg-white/10 transition-colors">
                                        <Upload className="text-gray-400 group-hover:text-white" size={24} />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium group-hover:text-white">Click to upload image</p>
                                    <p className="text-xs text-gray-600 mt-1">Supports JPG, PNG, WEBP</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            )}
        </div>
    );
}

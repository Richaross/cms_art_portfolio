'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { HeroService } from '@/app/lib/services/heroService';
import { HeroRepository } from '@/app/lib/repositories/heroRepository';
import { HeroSettings } from '@/app/domain/types';
import ImageUploader from './ImageUploader';
import { Facebook, Instagram, Linkedin, MessageCircle, X, Loader2 } from 'lucide-react';

export default function HeroEditor() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadSettings() {
      try {
        const repository = new HeroRepository(supabase);
        const service = new HeroService(repository);
        const data = await service.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error loading hero settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const repository = new HeroRepository(supabase);
      const service = new HeroService(repository);
      await service.updateSettings(settings);
      alert('Hero settings saved successfully!');
    } catch (error) {
      console.error('Error saving hero settings:', error);
      alert('Failed to save hero settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platform: keyof HeroSettings['socialLinks'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: { ...settings.socialLinks, [platform]: value },
    });
  };

  const updateSocialUrl = (platform: keyof HeroSettings['socialUrls'], value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialUrls: { ...settings.socialUrls, [platform]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (!settings) return <div className="p-8 text-red-500">Error loading settings.</div>;

  return (
    <div className="space-y-8 bg-neutral-900 border border-white/10 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Visuals */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Hero Visuals</h3>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">Background Title</label>
            <input
              type="text"
              value={settings.title || ''}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
              placeholder="e.g. Art Portfolio"
            />
          </div>

          <ImageUploader
            label="Background Image"
            value={settings.bgImageUrl || ''}
            onChange={(url) => setSettings({ ...settings, bgImageUrl: url })}
          />

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-400">
              Dim Intensity (Overlay)
            </label>
            <div className="flex gap-4">
              {[
                { value: 0.0, label: 'None' },
                { value: 0.4, label: 'Medium' },
                { value: 0.7, label: 'High' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, dimIntensity: option.value })}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition-all ${
                    settings.dimIntensity === option.value
                      ? 'bg-white text-black border-white'
                      : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Social Media */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Social Media Presence</h3>

          <div className="space-y-4">
            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Instagram size={20} className="text-pink-500" />
                  <span className="text-sm font-medium">Instagram</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.socialLinks.instagram}
                  onChange={(e) => updateSocialLink('instagram', e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </div>
              {settings.socialLinks.instagram && (
                <input
                  type="text"
                  value={settings.socialUrls.instagram}
                  onChange={(e) => updateSocialUrl('instagram', e.target.value)}
                  placeholder="https://instagram.com/your-profile"
                  className="w-full bg-black/30 border border-white/5 rounded p-2 text-sm focus:outline-none focus:border-white/20"
                />
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Linkedin size={20} className="text-blue-500" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.socialLinks.linkedin}
                  onChange={(e) => updateSocialLink('linkedin', e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </div>
              {settings.socialLinks.linkedin && (
                <input
                  type="text"
                  value={settings.socialUrls.linkedin}
                  onChange={(e) => updateSocialUrl('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full bg-black/30 border border-white/5 rounded p-2 text-sm focus:outline-none focus:border-white/20"
                />
              )}
            </div>

            {/* X / Twitter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <X size={20} className="text-gray-400" />
                  <span className="text-sm font-medium">X</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.socialLinks.x || false}
                  onChange={(e) => updateSocialLink('x', e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </div>
              {settings.socialLinks.x && (
                <input
                  type="text"
                  value={settings.socialUrls.x || ''}
                  onChange={(e) => updateSocialUrl('x', e.target.value)}
                  placeholder="https://x.com/your-profile"
                  className="w-full bg-black/30 border border-white/5 rounded p-2 text-sm focus:outline-none focus:border-white/20"
                />
              )}
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Facebook size={20} className="text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.socialLinks.facebook || false}
                  onChange={(e) => updateSocialLink('facebook', e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </div>
              {settings.socialLinks.facebook && (
                <input
                  type="text"
                  value={settings.socialUrls.facebook || ''}
                  onChange={(e) => updateSocialUrl('facebook', e.target.value)}
                  placeholder="https://facebook.com/your-profile"
                  className="w-full bg-black/30 border border-white/5 rounded p-2 text-sm focus:outline-none focus:border-white/20"
                />
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-green-500" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.socialLinks.whatsapp || false}
                  onChange={(e) => updateSocialLink('whatsapp', e.target.checked)}
                  className="w-4 h-4 accent-white"
                />
              </div>
              {settings.socialLinks.whatsapp && (
                <input
                  type="text"
                  value={settings.socialUrls.whatsapp || ''}
                  onChange={(e) => updateSocialUrl('whatsapp', e.target.value)}
                  placeholder="https://wa.me/your-number"
                  className="w-full bg-black/30 border border-white/5 rounded p-2 text-sm focus:outline-none focus:border-white/20"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Saving...
            </>
          ) : (
            'Save Hero Settings'
          )}
        </button>
      </div>
    </div>
  );
}

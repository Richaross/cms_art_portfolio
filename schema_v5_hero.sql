-- Create 'hero_settings' table (Single Row)
CREATE TABLE public.hero_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  bg_image_url TEXT,
  title TEXT DEFAULT 'Art Portfolio',
  dim_intensity FLOAT DEFAULT 0.4, -- Options: 0.0, 0.4, 0.7
  social_links JSONB DEFAULT '{"instagram": true, "linkedin": true, "facebook": false, "whatsapp": false, "x": false}'::jsonb,
  social_urls JSONB DEFAULT '{"instagram": "", "linkedin": "", "facebook": "", "whatsapp": "", "x": ""}'::jsonb,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow Public Read Hero" 
ON public.hero_settings FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow Auth Full Access Hero" 
ON public.hero_settings FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Insert initial data
INSERT INTO public.hero_settings (id, bg_image_url, title, dim_intensity)
VALUES (
  1, 
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop', 
  'Art Portfolio', 
  0.4
)
ON CONFLICT (id) DO NOTHING;

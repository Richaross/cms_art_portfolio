-- Create the section_items table
CREATE TABLE IF NOT EXISTS public.section_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10, 2),
    stock_qty INTEGER DEFAULT 0,
    stripe_link TEXT,
    is_sale_active BOOLEAN DEFAULT false,
    order_rank INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.section_items ENABLE ROW LEVEL SECURITY;

-- Policies (Matching existing pattern: public read, auth write)
CREATE POLICY "Public read access" ON public.section_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert" ON public.section_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON public.section_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON public.section_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- We can likely drop the old 'inventory' table eventually, but let's keep it for now strictly as backward compat or migrate data later.
-- Ideally, we migrate 'inventory' data to 'section_items' if we consider the old 'sections' as single-item collections.
-- For now, we will just add the new table.

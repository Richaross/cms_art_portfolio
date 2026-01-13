-- Add new columns for expanded News CMS
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS external_link TEXT;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

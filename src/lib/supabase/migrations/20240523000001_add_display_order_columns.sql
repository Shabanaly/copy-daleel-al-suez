-- Migration: Add display_order to articles and events
-- Description: Adds a sort order column to allow manual ordering of news and events.

-----------------------------------------
-- 1. Add columns to articles
-----------------------------------------
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'articles' 
        AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.articles ADD COLUMN display_order integer DEFAULT 0;
    END IF;
END $$;

-----------------------------------------
-- 2. Add columns to events
-----------------------------------------
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'events' 
        AND column_name = 'display_order'
    ) THEN
        ALTER TABLE public.events ADD COLUMN display_order integer DEFAULT 0;
    END IF;
END $$;

-- Helper function to check column existence if needed, but standard ALTER usually handles it if we use DO blocks
-- Alternatively, simple ALTER works if we are sure it doesn't exist.
-- To be safe and idempotent:
-- ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
-- ALTER TABLE public.events ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

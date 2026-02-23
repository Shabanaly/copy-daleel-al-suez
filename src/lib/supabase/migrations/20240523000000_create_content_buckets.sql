-- Migration: Create news and events storage buckets
-- Description: Creates dedicated public buckets for articles and events with RLS policies.

-----------------------------------------
-- 1. Create the buckets
-----------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('news', 'news', true),
    ('events', 'events', true)
ON CONFLICT (id) DO NOTHING;

-----------------------------------------
-- 2. Cleanup old policies for these buckets
-----------------------------------------
DROP POLICY IF EXISTS "Public View Access for news" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access for news" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access for news" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access for news" ON storage.objects;

DROP POLICY IF EXISTS "Public View Access for events" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access for events" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access for events" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access for events" ON storage.objects;

-----------------------------------------
-- 3. Create RLS Policies for news
-----------------------------------------

-- A) View Access (Public)
CREATE POLICY "Public View Access for news"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'news' );

-- B) Upload Access (Authenticated Users/Admins)
CREATE POLICY "Admin Upload Access for news"
    ON storage.objects FOR INSERT
    WITH CHECK ( 
        bucket_id = 'news' 
        AND auth.role() = 'authenticated'
    );

-- C) Update Access
CREATE POLICY "Admin Update Access for news"
    ON storage.objects FOR UPDATE
    USING ( 
        bucket_id = 'news' 
        AND auth.role() = 'authenticated' 
    );

-- D) Delete Access
CREATE POLICY "Admin Delete Access for news"
    ON storage.objects FOR DELETE
    USING ( 
        bucket_id = 'news' 
        AND auth.role() = 'authenticated' 
    );

-----------------------------------------
-- 4. Create RLS Policies for events
-----------------------------------------

-- A) View Access (Public)
CREATE POLICY "Public View Access for events"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'events' );

-- B) Upload Access
CREATE POLICY "Admin Upload Access for events"
    ON storage.objects FOR INSERT
    WITH CHECK ( 
        bucket_id = 'events' 
        AND auth.role() = 'authenticated'
    );

-- C) Update Access
CREATE POLICY "Admin Update Access for events"
    ON storage.objects FOR UPDATE
    USING ( 
        bucket_id = 'events' 
        AND auth.role() = 'authenticated' 
    );

-- D) Delete Access
CREATE POLICY "Admin Delete Access for events"
    ON storage.objects FOR DELETE
    USING ( 
        bucket_id = 'events' 
        AND auth.role() = 'authenticated' 
    );

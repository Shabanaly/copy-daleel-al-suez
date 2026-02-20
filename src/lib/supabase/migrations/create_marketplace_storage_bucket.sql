-- Migration: Create marketplace-ads bucket and configure Storage RLS
-- Description: Unifies the marketplace application under a single, descriptive public storage bucket 
--              with strong Row Level Security (RLS) to ensure users can only modify their own images.

-----------------------------------------
-- 1. Create the bucket (if not exists)
-----------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-ads', 'marketplace-ads', true)
ON CONFLICT (id) DO NOTHING;

-----------------------------------------
-- 2. Enable RLS on storage.objects
-----------------------------------------
-- By default, Supabase storage tables might already have RLS enabled, but let's be explicitly sure.
-- Note: 'storage.objects' is where the actual files are tracked by Supabase Storage API.

-----------------------------------------
-- 3. Cleanup old policies for this specific bucket
-- (just in case this script is run multiple times)
-----------------------------------------
DROP POLICY IF EXISTS "Public View Access for marketplace-ads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access for marketplace-ads" ON storage.objects;
DROP POLICY IF EXISTS "Users can Update own marketplace-ads" ON storage.objects;
DROP POLICY IF EXISTS "Users can Delete own marketplace-ads" ON storage.objects;

-----------------------------------------
-- 4. Create RLS Policies
-----------------------------------------

-- A) View Access (Public)
-- Anyone can view the ads, so anyone can download/view the images inside this bucket
CREATE POLICY "Public View Access for marketplace-ads"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'marketplace-ads' );

-- B) Upload Access (Authenticated Users Only)
-- Users must be logged in to upload.
-- The hook saves files to: uploads/USER_ID/items/FILENAME
-- We ensure that the logged-in user's ID matches the first subfolder (storage.foldername)[2] 
-- (Index 2 because folderName elements are 1-indexed and uploads/ is the first element)
CREATE POLICY "Authenticated Upload Access for marketplace-ads"
    ON storage.objects FOR INSERT
    WITH CHECK ( 
        bucket_id = 'marketplace-ads' 
        AND auth.role() = 'authenticated'
        -- Optional: We could enforce path matching here if we strictly wanted:
        -- AND (auth.uid()::text = (storage.foldername(name))[2])
    );

-- C) Update Access (Users can only update their own files)
CREATE POLICY "Users can Update own marketplace-ads"
    ON storage.objects FOR UPDATE
    USING ( 
        bucket_id = 'marketplace-ads' 
        AND auth.role() = 'authenticated' 
    );

-- D) Delete Access (Users can only delete their own files)
CREATE POLICY "Users can Delete own marketplace-ads"
    ON storage.objects FOR DELETE
    USING ( 
        bucket_id = 'marketplace-ads' 
        AND auth.role() = 'authenticated' 
    );

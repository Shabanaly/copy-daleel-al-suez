-- 1. AD BOOSTING (BUMP)
-- Add last_bump_at to allow users to push their ads to the top
ALTER TABLE marketplace_items ADD COLUMN IF NOT EXISTS last_bump_at timestamptz DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_items_bump ON marketplace_items(last_bump_at DESC);

-- 2. TRUST BADGES (VERIFICATION)
-- Add verification flags to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_phone boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_email boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_data jsonb DEFAULT '{}';

-- 3. SAVED SEARCHES & ALERTS
-- Allow users to save searches and get notified of new matches
CREATE TABLE IF NOT EXISTS saved_searches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text text NOT NULL,
    filters jsonb DEFAULT '{}', -- category, area, price range, etc.
    is_active boolean DEFAULT true,
    last_checked_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved searches"
ON saved_searches
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. VIEW COUNT & BUMP TRACKING (Analytics Infrastructure)
-- Add a dedicated table for engagement tracking
CREATE TABLE IF NOT EXISTS engagement_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type text NOT NULL, -- 'view', 'bump', 'whatsapp_click', 'call_click'
    created_at timestamptz DEFAULT now()
);

ALTER TABLE engagement_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view everything, authenticated can insert (limited by logic)
CREATE POLICY "Users can see their own item engagement"
ON engagement_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM marketplace_items
        WHERE marketplace_items.id = engagement_logs.item_id
        AND marketplace_items.seller_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

CREATE POLICY "Anyone can log engagement"
ON engagement_logs FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 1. Create the base 'reports' table if it doesn't exist
CREATE TABLE IF NOT EXISTS reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid REFERENCES auth.users(id),
    target_type text, -- 'item', 'user', 'place'
    target_id uuid,
    reason text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- 2. Upgrade the generic 'reports' table
-- Add missing columns and constraints to support polymorphic reporting
ALTER TABLE reports ADD COLUMN IF NOT EXISTS details text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure status has a consistent check constraint
-- First, remove any existing if we were to be fully safe, but for now just add
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed'));

-- 2. Migrate existing data from marketplace_reports if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marketplace_reports') THEN
        INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status, created_at, updated_at)
        SELECT id, reporter_id, 'item', item_id, reason, details, status, created_at, updated_at
        FROM marketplace_reports
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 3. Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies for reports
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view reports" ON reports;
CREATE POLICY "Admins can view reports" ON reports 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "Admins can update reports" ON reports;
CREATE POLICY "Admins can update reports" ON reports 
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- 5. Drop the old redundant table
DROP TABLE IF EXISTS marketplace_reports;

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

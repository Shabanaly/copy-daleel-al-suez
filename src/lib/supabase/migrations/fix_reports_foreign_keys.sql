-- 1. Add explicit foreign keys to the reports table for Supabase joins
-- Supabase requires explicit foreign keys to perform joins like item:marketplace_items!item_id(...)
-- We keep target_type and target_id for generic logic, but use explicit keys for relational queries

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS reported_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix the reporter_id to reference profiles instead of auth.users so joins work effortlessly
ALTER TABLE reports
DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;

ALTER TABLE reports
ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Backfill explicit keys from existing generic data
-- If any reports exist with target_type = 'item', copy target_id to item_id
UPDATE reports 
SET item_id = target_id 
WHERE target_type = 'item' AND item_id IS NULL;

-- If any reports exist with target_type = 'user', copy target_id to reported_user_id
UPDATE reports 
SET reported_user_id = target_id 
WHERE target_type = 'user' AND reported_user_id IS NULL;

-- 3. Create a trigger to automatically sync the explicit keys when generic fields are used
CREATE OR REPLACE FUNCTION sync_report_foreign_keys()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_type = 'item' THEN
        NEW.item_id := NEW.target_id;
    ELSIF NEW.target_type = 'user' THEN
        NEW.reported_user_id := NEW.target_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_report_fks ON reports;
CREATE TRIGGER trg_sync_report_fks
BEFORE INSERT OR UPDATE ON reports
FOR EACH ROW
EXECUTE PROCEDURE sync_report_foreign_keys();

-- 4. Create Indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_reports_item_id ON reports(item_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);

-- 5. Add DELETE policy for Admins (Fixes silent deletion failure)
DROP POLICY IF EXISTS "Admins can delete reports" ON reports;
CREATE POLICY "Admins can delete reports" ON reports 
    FOR DELETE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

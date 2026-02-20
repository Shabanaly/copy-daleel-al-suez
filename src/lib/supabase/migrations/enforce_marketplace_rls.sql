-- 1. Ensure RLS is enabled on marketplace_items
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON marketplace_items;
DROP POLICY IF EXISTS "Users can insert their own items" ON marketplace_items;
DROP POLICY IF EXISTS "Users can update their own items" ON marketplace_items;
DROP POLICY IF EXISTS "Users can delete their own items" ON marketplace_items;

-- 3. Define explicit policies

-- 3.1 VIEW: Active items are public. Pending/Rejected/Removed are restricted.
-- Users can see their own items regardless of status. Admins can see everything.
CREATE POLICY "Public items are viewable by everyone"
ON marketplace_items FOR SELECT
USING (
    status = 'active' 
    OR auth.uid() = seller_id 
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 3.2 INSERT: Authenticated users can insert items as themselves.
CREATE POLICY "Users can insert their own items"
ON marketplace_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- 3.3 UPDATE: Users can update their own items. Admins can update any item.
CREATE POLICY "Users can update their own items"
ON marketplace_items FOR UPDATE
TO authenticated
USING (
    auth.uid() = seller_id 
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    auth.uid() = seller_id 
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 3.4 DELETE: Users can delete their own items. Admins can delete any item.
CREATE POLICY "Users can delete their own items"
ON marketplace_items FOR DELETE
TO authenticated
USING (
    auth.uid() = seller_id 
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 4. Audit Log Policies (Restricted to Admins for VIEW, Authenticated for INSERT)
-- Ensure the table and column exist before applying policies
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
        
        -- Ensure user_id column exists (just in case)
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
            ALTER TABLE audit_logs ADD COLUMN user_id uuid REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

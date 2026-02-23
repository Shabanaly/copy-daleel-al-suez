-- Update Business Claims RLS to allow both admin and super_admin
DROP POLICY IF EXISTS "Admins can manage all claims" ON business_claims;

CREATE POLICY "Admins can manage all claims"
    ON business_claims FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

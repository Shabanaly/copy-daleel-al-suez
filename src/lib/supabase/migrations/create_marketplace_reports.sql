-- Create marketplace_reports table
CREATE TABLE IF NOT EXISTS marketplace_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
    reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    reason text NOT NULL,
    details text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Anyone authenticated can submit a report
CREATE POLICY "Users can create reports"
ON marketplace_reports FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Admins and Super Admins can view all reports
CREATE POLICY "Admins can view reports"
ON marketplace_reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- 3. Admins and Super Admins can update reports (to change status)
CREATE POLICY "Admins can update reports"
ON marketplace_reports FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);

-- Indexes
CREATE INDEX idx_reports_status ON marketplace_reports(status);
CREATE INDEX idx_reports_item_id ON marketplace_reports(item_id);
CREATE INDEX idx_reports_created_at ON marketplace_reports(created_at DESC);

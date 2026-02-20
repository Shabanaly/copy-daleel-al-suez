-- 1. Create Flash Deals Table
CREATE TABLE IF NOT EXISTS flash_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    original_price NUMERIC,
    deal_price NUMERIC NOT NULL,
    discount_percentage INTEGER,
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL,
    current_claims INTEGER NOT NULL DEFAULT 0,
    max_claims INTEGER,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_flash_deals_place ON flash_deals(place_id);
CREATE INDEX IF NOT EXISTS idx_flash_deals_status ON flash_deals(status, end_date);

-- 3. Enable Row Level Security
ALTER TABLE flash_deals ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies
-- Anyone can view active deals
DROP POLICY IF EXISTS "Anyone can view active flash deals" ON flash_deals;
CREATE POLICY "Anyone can view active flash deals"
ON flash_deals FOR SELECT
USING (status = 'active' AND end_date > now());

-- Place owners can manage their deals
DROP POLICY IF EXISTS "Place owners can manage their deals" ON flash_deals;
CREATE POLICY "Place owners can manage their deals"
ON flash_deals FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM places
        WHERE places.id = flash_deals.place_id
        AND places.owner_id = auth.uid()
    )
);

-- 5. RPC for Atomic Claim Counting
CREATE OR REPLACE FUNCTION increment_flash_deal_claims(p_deal_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE flash_deals
    SET current_claims = current_claims + 1
    WHERE id = p_deal_id
    AND status = 'active'
    AND (max_claims IS NULL OR current_claims < max_claims)
    AND end_date > now();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal is not active or has reached maximum claims';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

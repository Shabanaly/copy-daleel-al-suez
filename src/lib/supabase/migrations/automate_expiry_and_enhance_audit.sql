-- 1. Function to mark expired ads
-- This function checks for items where expires_at < NOW() and status is 'active'
-- It marks them as 'expired'
CREATE OR REPLACE FUNCTION handle_expired_marketplace_items()
RETURNS void AS $$
BEGIN
    UPDATE marketplace_items
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'active'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 2. Enhance audit_logs with more context
-- This helps in tracking WHO did WHAT and WHY
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Add target_type if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'target_type') THEN
            ALTER TABLE audit_logs ADD COLUMN target_type text;
        END IF;

        -- Add severity if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'severity') THEN
            ALTER TABLE audit_logs ADD COLUMN severity text DEFAULT 'info';
        END IF;

        -- Add ip_address if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'ip_address') THEN
            ALTER TABLE audit_logs ADD COLUMN ip_address text;
        END IF;

        -- Ensure user_id column exists (just in case)
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'user_id') THEN
            ALTER TABLE audit_logs ADD COLUMN user_id uuid REFERENCES auth.users(id);
        END IF;
    END IF;
END $$;

-- 3. Trigger to auto-set expires_at if it's NULL (e.g., 30 days from creation)
CREATE OR REPLACE FUNCTION set_marketplace_item_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NEW.created_at + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_marketplace_item_expiry ON marketplace_items;
CREATE TRIGGER trg_set_marketplace_item_expiry
BEFORE INSERT ON marketplace_items
FOR EACH ROW
EXECUTE FUNCTION set_marketplace_item_expiry();

-- 4. Simple Index for expiry checks
CREATE INDEX IF NOT EXISTS idx_items_expiry ON marketplace_items(status, expires_at) WHERE status = 'active';

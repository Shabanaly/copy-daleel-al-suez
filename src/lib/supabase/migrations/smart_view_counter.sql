-- Smart View Counter Migration
-- This migration transforms the simple view increment into a session-aware de-duplicated system.

-- 1. Enhance engagement_logs with session and IP tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'engagement_logs' AND COLUMN_NAME = 'session_id') THEN
        ALTER TABLE engagement_logs ADD COLUMN session_id text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'engagement_logs' AND COLUMN_NAME = 'ip_address') THEN
        ALTER TABLE engagement_logs ADD COLUMN ip_address text;
    END IF;
END $$;

-- 2. Create more efficient index for de-duplication checks
CREATE INDEX IF NOT EXISTS idx_engagement_logs_dedup 
ON engagement_logs (item_id, event_type, created_at DESC) 
WHERE event_type = 'view';

-- 3. Smart View Function
-- This function handles de-duplication at the database level
CREATE OR REPLACE FUNCTION log_smart_view(
    p_item_id uuid,
    p_user_id uuid DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_ip_address text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    v_already_viewed boolean;
BEGIN
    -- Check if this specific user/session viewed this item in the last 24 hours
    SELECT EXISTS (
        SELECT 1 FROM engagement_logs
        WHERE item_id = p_item_id
        AND event_type = 'view'
        AND created_at > now() - interval '24 hours'
        AND (
            (p_user_id IS NOT NULL AND user_id = p_user_id)
            OR 
            (p_session_id IS NOT NULL AND session_id = p_session_id)
        )
    ) INTO v_already_viewed;

    IF v_already_viewed THEN
        RETURN false; -- De-duplicated
    END IF;

    -- Log the view
    INSERT INTO engagement_logs (item_id, user_id, session_id, ip_address, event_type)
    VALUES (p_item_id, p_user_id, p_session_id, p_ip_address, 'view');

    -- Increment the main counter
    UPDATE marketplace_items 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = p_item_id;

    RETURN true; -- New view recorded
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

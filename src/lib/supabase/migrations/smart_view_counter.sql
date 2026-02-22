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
ON engagement_logs (entity_id, event_type, created_at DESC) 
WHERE event_type = 'view';

-- Normalization: Rename views to view_count if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_questions' AND column_name='views') THEN
        ALTER TABLE community_questions RENAME COLUMN views TO view_count;
    END IF;
END $$;

-- Smart View Function
-- This function handles de-duplication at the database level for all entities
CREATE OR REPLACE FUNCTION log_smart_view(
    p_entity_id uuid,
    p_entity_type text,
    p_user_id uuid DEFAULT NULL,
    p_session_id text DEFAULT NULL,
    p_ip_address text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    v_already_viewed boolean;
    v_table_name text;
BEGIN
    -- Map entity type to table name
    v_table_name := CASE 
        WHEN p_entity_type = 'place' THEN 'places'
        WHEN p_entity_type = 'marketplace_item' THEN 'marketplace_items'
        WHEN p_entity_type = 'event' THEN 'events'
        WHEN p_entity_type = 'article' THEN 'articles'
        WHEN p_entity_type = 'community_question' THEN 'community_questions'
        WHEN p_entity_type = 'category' THEN 'categories'
        ELSE p_entity_type || 's'
    END;

    -- Check if this specific user/session viewed this item in the last 24 hours
    SELECT EXISTS (
        SELECT 1 FROM engagement_logs
        WHERE entity_id = p_entity_id
        AND entity_type = p_entity_type
        AND event_type = 'view'
        AND created_at > now() - interval '24 hours'
        AND (
            (p_user_id IS NOT NULL AND user_id = p_user_id)
            OR 
            (p_session_id IS NOT NULL AND session_id = p_session_id)
            OR
            (p_user_id IS NULL AND p_session_id IS NULL AND p_ip_address IS NOT NULL AND ip_address = p_ip_address)
        )
    ) INTO v_already_viewed;

    IF v_already_viewed THEN
        RETURN false; -- De-duplicated
    END IF;

    -- Log the view
    INSERT INTO engagement_logs (entity_id, entity_type, user_id, session_id, ip_address, event_type)
    VALUES (p_entity_id, p_entity_type, p_user_id, p_session_id, p_ip_address, 'view');

    -- Increment the main counter (Now standardized to view_count)
    EXECUTE format('UPDATE %I SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1', v_table_name)
    USING p_entity_id;

    RETURN true; -- New view recorded
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

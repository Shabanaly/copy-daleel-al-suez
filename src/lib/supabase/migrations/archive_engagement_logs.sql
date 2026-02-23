-- Migration/Script: Archive Engagement Logs
-- Purpose: Move logs older than 30 days to an archive table to keep engagement_logs slim and fast.

-- 1. Create Archive Table (if not exists)
CREATE TABLE IF NOT EXISTS public.engagement_logs_archive (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id uuid,
    entity_type text,
    user_id uuid,
    session_id text,
    ip_address text,
    event_type text,
    created_at timestamptz DEFAULT now(),
    metadata jsonb
);

-- 2. Create index on archive table
CREATE INDEX IF NOT EXISTS idx_engagement_logs_archive_created_at ON engagement_logs_archive(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_logs_archive_entity ON engagement_logs_archive(entity_id, entity_type);

-- 3. Procedure to perform archiving
CREATE OR REPLACE FUNCTION archive_old_engagement_logs(days_to_keep int DEFAULT 30)
RETURNS int AS $$
DECLARE
    moved_count int;
BEGIN
    -- Move data
    WITH deleted AS (
        DELETE FROM engagement_logs
        WHERE created_at < now() - (days_to_keep || ' days')::interval
        RETURNING *
    )
    INSERT INTO engagement_logs_archive (
        entity_id, entity_type, user_id, session_id, ip_address, event_type, created_at, metadata
    )
    SELECT 
        entity_id, entity_type, user_id, session_id, ip_address, event_type, created_at, metadata
    FROM deleted;

    GET DIAGNOSTICS moved_count = ROW_COUNT;
    RETURN moved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Initial Run (Optional: uncomment to run immediately)
-- SELECT archive_old_engagement_logs(30);

-- NOTE: In a real production environment, you would schedule this via a cron job
-- (e.g., pg_cron or an external cron service calling a Supabase Edge Function).

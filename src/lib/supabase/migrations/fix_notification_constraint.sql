-- Fix notifications_type_check constraint to allow marketplace types
DO $$ 
BEGIN 
    -- 1. Drop the old constraint
    ALTER TABLE IF EXISTS notifications 
    DROP CONSTRAINT IF EXISTS notifications_type_check;

    -- 2. Add the new expanded constraint
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'general', 
        'system_alert', 
        'marketplace_approve', 
        'marketplace_reject', 
        'marketplace_update',
        'lead_generation',
        'bump_alert'
    ));
END $$;

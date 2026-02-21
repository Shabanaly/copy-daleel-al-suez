-- Expand notifications_type_check to include all required platform types
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
        'status_update', 
        'marketplace_approve', 
        'marketplace_reject', 
        'marketplace_update',
        'lead_generation',
        'bump_alert',
        'review_reply',
        'queue_update',
        'deal_alert',
        'answer_accepted',
        'new_follower',
        'place_update',
        'system'
    ));
END $$;

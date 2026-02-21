-- 1. Add price_type column to marketplace_items
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS price_type text DEFAULT 'fixed' 
CHECK (price_type IN ('fixed', 'negotiable', 'contact'));

-- 2. Trigger for automated notifications on approval/rejection
CREATE OR REPLACE FUNCTION notify_on_marketplace_item_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_title text;
    notification_message text;
BEGIN
    -- Only act on status changes FROM 'pending'
    -- This ensures user-toggles (e.g. sold -> active) don't trigger "Approved" notifications
    IF (OLD.status = 'pending' AND OLD.status != NEW.status) THEN
        
        IF NEW.status = 'active' THEN
            notification_title := 'تم قبول إعلانك 🎉';
            notification_message := format('تمت مراجعة وقبول إعلانك: "%s". الإعلان الآن متاح للجميع على المنصة.', NEW.title);
        ELSIF NEW.status = 'rejected' THEN
            notification_title := 'بخصوص إعلانك ⚠️';
            notification_message := format('عذراً، لم يتم قبول إعلانك: "%s". السبب: %s', NEW.title, COALESCE(NEW.rejection_reason, 'مخالف لشروط النشر'));
        END IF;

        -- Insert notification if title is set
        IF notification_title IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type, data)
            VALUES (
                NEW.seller_id, 
                notification_title, 
                notification_message, 
                'marketplace_update',
                jsonb_build_object('item_id', NEW.id, 'slug', NEW.slug, 'status', NEW.status)
            );
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_marketplace_status ON marketplace_items;
CREATE TRIGGER trg_notify_marketplace_status
AFTER UPDATE ON marketplace_items
FOR EACH ROW
EXECUTE FUNCTION notify_on_marketplace_item_status_change();

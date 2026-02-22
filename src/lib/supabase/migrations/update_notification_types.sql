-- 1. حذف الفهارس المكررة (Redundant Indexes)
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_created;

-- 2. حذف الأعمدة غير المستخدمة (Unused Columns)
ALTER TABLE public.notifications 
DROP COLUMN IF EXISTS body,
DROP COLUMN IF EXISTS link,
DROP COLUMN IF EXISTS read_at;

-- 3. تحديث قيد التحقق من النوع (Update Type Constraint)
-- أولاً نحذف القيد القديم
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- ثم نضيف القيد الجديد بجميع الأنواع المستخدمة فعلياً في الكود
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    'general',
    'system_alert',
    'status_update',
    'marketplace_approve',
    'marketplace_reject',
    'marketplace_update',
    'review_reply',
    'place_update',
    'system',
    'community_answer',
    'community_accept',
    'alert',
    'answer_accepted'
  ])
);


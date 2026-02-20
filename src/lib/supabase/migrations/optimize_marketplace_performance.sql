-- 1. Add GIN index for JSONB attributes
-- This speeds up filtering by keys inside the attributes column (e.g., brand, ram, etc.)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_attributes_gin ON marketplace_items USING GIN (attributes);

-- 2. Add Trigram index for fuzzy search on title and description
-- This is much faster than ILIKE %...%
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_marketplace_items_title_trgm ON marketplace_items USING GIST (title gist_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_desc_trgm ON marketplace_items USING GIST (description gist_trgm_ops);

-- 3. GIN index for images array if needed for searching specific image URLs (optional but good for consistency)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_images_gin ON marketplace_items USING GIN (images);

-- 4. Composite index for common filtering pattern: (category, status, created_at)
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category_status_created ON marketplace_items (category, status, created_at DESC);

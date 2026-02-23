import { MarketplaceItem, MarketplaceItemCondition } from "@/domain/entities/marketplace-item";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseMarketplaceRepository {
    private readonly listFields = "id, slug, title, price, price_type, category, condition, images, location, area_id, seller_id, status, is_featured, view_count, created_at, expires_at, last_bump_at, profiles:seller_id(full_name, avatar_url, phone), areas(name, districts(name))";
    private readonly detailFields = "*, profiles:seller_id(full_name, avatar_url, phone, created_at), areas(name, districts(name))";

    constructor(private supabase: SupabaseClient) { }

    async getItems(filters?: any, limit: number = 20, offset: number = 0): Promise<{ items: MarketplaceItem[], count: number }> {
        const supabase = this.supabase;
        if (!supabase) return { items: [], count: 0 };

        let selectFields = this.listFields;

        if (filters?.districtId) {
            selectFields = "id, slug, title, price, price_type, category, condition, images, location, area_id, seller_id, status, is_featured, view_count, created_at, expires_at, last_bump_at, profiles:seller_id(full_name, avatar_url, phone), areas!inner(name, district_id, districts(name))";
        }

        let dbQuery = supabase
            .from("marketplace_items")
            .select(selectFields, { count: 'exact' })
            .eq("status", "active")
            .order("is_featured", { ascending: false }) // Featured first
            .order("last_bump_at", { ascending: false }) // Then by last boost
            .order("created_at", { ascending: false });

        if (filters?.category) {
            dbQuery = dbQuery.eq("category", filters.category);
        }
        if (filters?.areaId) {
            dbQuery = dbQuery.eq("area_id", filters.areaId);
        }
        if (filters?.districtId) {
            dbQuery = dbQuery.eq("areas.district_id", filters.districtId);
        }
        if (filters?.minPrice) {
            dbQuery = dbQuery.gte("price", filters.minPrice);
        }
        if (filters?.maxPrice) {
            dbQuery = dbQuery.lte("price", filters.maxPrice);
        }
        if (filters?.condition) {
            dbQuery = dbQuery.eq("condition", filters.condition);
        }
        if (filters?.query) {
            const sanitizedQuery = filters.query.replace(/['"]/g, ''); // Basic sanitization
            dbQuery = dbQuery.or(`title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`);
        }
        if (filters?.attributes && Object.keys(filters.attributes).length > 0) {
            dbQuery = dbQuery.contains("attributes", filters.attributes);
        }

        const { data, error, count } = await dbQuery.range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching marketplace items:", error);
            return { items: [], count: 0 };
        }

        return {
            items: data.map((row: any) => this.mapToEntity(row)),
            count: count || 0
        };
    }

    async getItemById(id: string): Promise<MarketplaceItem | null> {
        const { data, error } = await this.supabase
            .from("marketplace_items")
            .select(this.detailFields)
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return this.mapToEntity(data);
    }

    async getItemBySlug(slug: string): Promise<MarketplaceItem | null> {
        // 1. Try by slug
        const { data, error } = await this.supabase
            .from("marketplace_items")
            .select(this.detailFields)
            .eq("slug", slug)
            .maybeSingle();

        if (data) return this.mapToEntity(data);

        // 2. Fallback to ID if it's a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(slug)) {
            return this.getItemById(slug);
        }

        return null;
    }

    async createItem(item: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at' | 'viewCount' | 'is_featured'>): Promise<MarketplaceItem> {
        // Generate slug from title + random string
        const slug = item.slug || `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
        const status = item.status || 'pending';

        const { data, error } = await this.supabase
            .from("marketplace_items")
            .insert({
                title: item.title,
                slug: slug,
                description: item.description,
                price: item.price,
                price_type: item.price_type,
                category: item.category,
                status: status,
                last_bump_at: new Date().toISOString(),
                condition: item.condition,
                images: item.images,
                area_id: item.area_id,
                location: item.location,
                seller_id: item.seller_id,
                seller_phone: item.seller_phone,
                seller_whatsapp: item.seller_whatsapp,
                attributes: item.attributes || {}
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(data);
    }

    async updateItem(id: string, userId: string, updates: Partial<MarketplaceItem>): Promise<void> {
        const { error } = await this.supabase
            .from("marketplace_items")
            .update({
                title: updates.title,
                description: updates.description,
                price: updates.price,
                price_type: updates.price_type,
                category: updates.category,
                condition: updates.condition,
                images: updates.images,
                area_id: updates.area_id,
                location: updates.location,
                seller_phone: updates.seller_phone,
                seller_whatsapp: updates.seller_whatsapp,
                attributes: updates.attributes,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("seller_id", userId);

        if (error) throw new Error(error.message);
    }

    async approveItem(id: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({ status: 'active' })
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async rejectItem(id: string, reason: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({
                status: 'rejected',
                rejection_reason: reason
            })
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async markAsSold(id: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({ status: 'sold' })
            .eq("id", id)
            .eq("seller_id", userId); // Ensure ownership

        if (error) throw new Error(error.message);
    }

    async markAsActive(id: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({ status: 'active' })
            .eq("id", id)
            .eq("seller_id", userId);

        if (error) throw new Error(error.message);
    }

    async relistItem(id: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({
                status: 'active',
                expires_at: null,
                created_at: new Date().toISOString()
            })
            .eq("id", id)
            .eq("seller_id", userId);

        if (error) throw new Error(error.message);
    }

    async deleteItem(id: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        // 1. Get the item first to get image URLs for cleanup
        const { data: item, error: getError } = await supabase
            .from("marketplace_items")
            .select("images")
            .eq("id", id)
            .single();

        if (getError) {
            if (getError.code === 'PGRST116') return;
            throw new Error(getError.message);
        }

        // 2. Storage Cleanup
        if (item?.images && item.images.length > 0) {
            for (const imageUrl of item.images) {
                try {
                    if (imageUrl.includes('storage/v1/object/public/')) {
                        const parts = imageUrl.split('storage/v1/object/public/')[1].split('/');
                        const bucket = parts[0];
                        const path = parts.slice(1).join('/');
                        if (bucket && path) {
                            await supabase.storage.from(bucket).remove([path]);
                        }
                    }
                } catch (err) {
                    console.error('Failed to cleanup image from storage:', err);
                }
            }
        }

        // 3. Permanent delete
        const { error } = await supabase
            .from("marketplace_items")
            .delete()
            .eq("id", id);

        if (error) throw new Error(error.message);
    }

    async bumpItem(id: string, userId: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from("marketplace_items")
            .update({ last_bump_at: new Date().toISOString() })
            .eq("id", id)
            .eq("seller_id", userId);

        if (error) throw new Error(error.message);

        // Log bump analytics
        this.logEngagement(id, 'bump', userId, supabase).catch(() => { });
    }

    async logEngagement(itemId: string, eventType: string, userId?: string, client?: unknown, sessionId?: string, ipAddress?: string): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return;

        if (eventType === 'view') {
            await supabase.rpc('log_smart_view', {
                p_entity_id: itemId,
                p_entity_type: 'marketplace_item',
                p_user_id: userId,
                p_session_id: sessionId,
                p_ip_address: ipAddress
            });
        } else {
            await supabase.from("engagement_logs").insert({
                entity_id: itemId,
                entity_type: 'marketplace_item',
                user_id: userId,
                session_id: sessionId,
                ip_address: ipAddress,
                event_type: eventType
            });
        }
    }

    async getMyItems(userId: string, client?: unknown): Promise<MarketplaceItem[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("marketplace_items")
            .select(this.listFields)
            .eq("seller_id", userId)
            .neq("status", "removed")
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToEntity(row));
    }

    private mapToEntity(row: any): MarketplaceItem {
        return {
            id: row.id,
            slug: row.slug || row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            category: row.category,
            condition: row.condition,
            images: row.images || [],
            location: row.location,
            area_id: row.area_id,
            area_name: row.areas?.name,
            district_name: row.areas?.districts?.name,
            seller_id: row.seller_id,
            seller_name: row.profiles?.full_name,
            seller_avatar: row.profiles?.avatar_url,
            seller_phone: row.seller_phone,
            seller_whatsapp: row.seller_whatsapp,
            status: row.status,
            rejection_reason: row.rejection_reason,
            is_featured: row.is_featured,
            viewCount: row.view_count || 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
            expires_at: row.expires_at,
            attributes: row.attributes,
            price_type: row.price_type,
            last_bump_at: row.last_bump_at
        };
    }

    async getHomeAds(limit: number = 6, sortType: 'random' | 'most_viewed' | 'lowest_price' = 'random', client?: unknown): Promise<MarketplaceItem[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const now = new Date().toISOString();
        let query = supabase
            .from('marketplace_items')
            .select(this.listFields)
            .eq('status', 'active')
            .or(`expires_at.is.null,expires_at.gt.${now}`);

        if (sortType === 'most_viewed') {
            query = query.order('view_count', { ascending: false }).limit(limit);
            const { data, error } = await query;
            if (error) return [];
            return (data || []).map(row => this.mapToEntity(row));
        }

        if (sortType === 'lowest_price') {
            query = query.order('price', { ascending: true }).limit(limit);
            const { data, error } = await query;
            if (error) return [];
            return (data || []).map(row => this.mapToEntity(row));
        }

        const { data: featured } = await supabase
            .from('marketplace_items')
            .select(this.listFields)
            .eq('status', 'active')
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .eq('is_featured', true)
            .limit(2);

        const featuredItems = (featured || []).map(row => this.mapToEntity(row));
        const remaining = limit - featuredItems.length;

        if (remaining <= 0) return featuredItems.slice(0, limit);

        const { data: randomPool } = await supabase
            .from('marketplace_items')
            .select(this.listFields)
            .eq('status', 'active')
            .or(`expires_at.is.null,expires_at.gt.${now}`)
            .eq('is_featured', false)
            .order('created_at', { ascending: false })
            .limit(remaining * 3);

        const poolItems = (randomPool || []).map(row => this.mapToEntity(row));

        for (let i = poolItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [poolItems[i], poolItems[j]] = [poolItems[j], poolItems[i]];
        }

        return [...featuredItems, ...poolItems.slice(0, remaining)];
    }

    async getSellerProfile(sellerId: string, client?: unknown): Promise<any | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, phone, created_at, is_verified_phone, is_verified_email")
            .eq("id", sellerId)
            .single();

        if (error) return null;
        return data;
    }

    async getSellerItems(sellerId: string, client?: unknown): Promise<MarketplaceItem[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("marketplace_items")
            .select(this.listFields)
            .eq("seller_id", sellerId)
            .eq("status", "active")
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data.map((row: any) => this.mapToEntity(row));
    }
}

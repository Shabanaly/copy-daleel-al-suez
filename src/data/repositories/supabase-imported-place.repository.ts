import { SupabaseClient } from "@supabase/supabase-js";
import { ImportedPlaceRepo } from "@/domain/interfaces/imported-place-repository.interface";

export class SupabaseImportedPlaceRepository implements ImportedPlaceRepo {
    constructor(private supabase?: SupabaseClient) { }

    async create(data: any, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('imported_places')
            .upsert(data, { onConflict: 'google_place_id' });

        if (error) throw error;
    }

    async getByGooglePlaceId(googlePlaceId: string, client?: unknown): Promise<any | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('imported_places')
            .select('*')
            .eq('google_place_id', googlePlaceId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async listPending(client?: unknown): Promise<any[]> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('imported_places')
            .select('*, local_category:categories(name)')
            .in('status', ['pending', 'auto_pending'])
            .order('confidence_score', { ascending: false });

        if (error) throw error;
        return data;
    }

    async updateStatus(id: string, status: string, client?: unknown): Promise<void> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) throw new Error("Supabase client not initialized");

        const { error } = await supabase
            .from('imported_places')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }

    async matchCategory(googleTypes: string[], name?: string, client?: unknown): Promise<string | null> {
        const supabase = (client as SupabaseClient) || this.supabase;
        if (!supabase) return null;

        // 1. Match by Google Types first
        if (googleTypes && googleTypes.length > 0) {
            const { data, error } = await supabase
                .from('google_types_map')
                .select('local_category_id')
                .in('google_type', googleTypes)
                .limit(1)
                .maybeSingle();

            if (!error && data) return data.local_category_id;
        }

        // 2. Exact or fuzzy match by name keywords as fallback
        if (name) {
            const nameLower = name.toLowerCase();
            const mappings = [
                { keywords: ['مطعم', 'restaurant', 'food', 'اكل', 'اكلة', 'وجبات', 'شاورما', 'فطائر', 'كشري', 'سندوتش'], category: '588e7a2b-cb84-497d-936b-100aaa0d8ad5' },
                { keywords: ['مشويات', 'grill', 'كباب', 'كفتة', 'حواوشي', 'باربكيو'], category: 'e4cbc035-72d3-4d83-a793-e0efa18dde1c' },
                { keywords: ['كافيه', 'cafe', 'قهوة', 'coffee', 'مقهى', 'شاي', 'نسكافيه'], category: 'bec664e7-fb02-434c-84d6-3ed591dde4c5' },
                { keywords: ['فندق', 'hotel', 'resort', 'منتجع', 'نزل', 'استراحة'], category: 'a61750d8-3aeb-4209-b0e4-40b608c6d552' },
                { keywords: ['مستشفى', 'hospital', 'طوارئ', 'اسعاف'], category: '42fb7d1e-d41a-4ed3-849f-f406100f1be0' },
                { keywords: ['عيادة', 'clinic', 'دكتور', 'طبيب', 'كشف', 'مختبر', 'مركز طبي'], category: '55923dee-2dea-4301-8ccc-689b847d96db' },
                { keywords: ['سوبر ماركت', 'supermarket', 'ماركت', 'بقال', 'grocery', 'تموين', 'خضروات'], category: '586b4ca9-d680-457e-b2b7-1f4d0758325a' },
                { keywords: ['صيدلية', 'pharmacy', 'صيدليه', 'دواء'], category: '53eba971-e76b-4ea9-a446-27c6adb41312' },
                { keywords: ['جيم', 'gym', 'رياضة', 'فتنس', 'لياقة', 'تخسيس'], category: '907e36c5-dc4c-49d4-8d3f-35988627bda1' },
                { keywords: ['تجميل', 'beauty', 'مركز تجميل', 'كوافير', 'salon', 'حلاقة', 'بيوتي'], category: 'bbff3c98-f55f-46bd-8a62-d98bbe26b43b' },
                { keywords: ['حلويات', 'sweets', 'حلواني', 'تورتة', 'جاتوه'], category: '3df8cdbd-b78c-4a81-847c-40fd465edf3d' },
                { keywords: ['مخبز', 'bakery', 'فرن', 'مخبوزات', 'عيش'], category: '96cf76da-f20b-4de6-ad2f-1e291f9c0b65' },
                { keywords: ['سيارات', 'car', 'مركز خدمة', 'ميكانيكي', 'زيوت'], category: '67690b2a-0f52-4a90-905c-149eaa405d16' },
                { keywords: ['مدرسة', 'school', 'تعليم', 'حضانة', 'روضة'], category: 'a6d16648-2dce-4a31-867a-5ff6de0990ab' },
            ];

            for (const m of mappings) {
                if (m.keywords.some(k => nameLower.includes(k))) {
                    return m.category;
                }
            }
        }

        return null;
    }
}

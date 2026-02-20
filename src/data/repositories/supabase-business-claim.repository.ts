import { SupabaseClient } from "@supabase/supabase-js";
import { IBusinessClaimRepository } from "../../domain/repositories/business-claim.repository";
import { BusinessClaim, CreateBusinessClaimDTO } from "../../domain/entities/business-claim";

export class SupabaseBusinessClaimRepository implements IBusinessClaimRepository {
    constructor(private supabase?: SupabaseClient) { }

    async submitClaim(userId: string, data: CreateBusinessClaimDTO): Promise<BusinessClaim> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const { data: claim, error } = await this.supabase
            .from('business_claims')
            .insert({
                place_id: data.placeId,
                user_id: userId,
                full_name: data.fullName,
                phone: data.phone,
                business_role: data.businessRole,
                proof_image_url: data.proofImageUrl,
                additional_notes: data.additionalNotes,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return this.mapToEntity(claim);
    }

    async getClaimsByUser(userId: string): Promise<BusinessClaim[]> {
        if (!this.supabase) return [];

        const { data, error } = await this.supabase
            .from('business_claims')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return (data || []).map(row => this.mapToEntity(row));
    }

    async getClaimByPlace(placeId: string): Promise<BusinessClaim | null> {
        if (!this.supabase) return null;

        const { data, error } = await this.supabase
            .from('business_claims')
            .select('*')
            .eq('place_id', placeId)
            .eq('status', 'pending')
            .maybeSingle();

        if (error) return null;
        return data ? this.mapToEntity(data) : null;
    }

    async updateClaimStatus(claimId: string, status: 'approved' | 'rejected', reviewerId: string, reason?: string): Promise<void> {
        if (!this.supabase) throw new Error("Supabase client not initialized");

        const updates: any = {
            status,
            reviewer_id: reviewerId,
            updated_at: new Date().toISOString()
        };

        if (reason) updates.rejection_reason = reason;

        const { error } = await this.supabase
            .from('business_claims')
            .update(updates)
            .eq('id', claimId);

        if (error) throw new Error(error.message);
    }

    private mapToEntity(row: any): BusinessClaim {
        return {
            id: row.id,
            placeId: row.place_id,
            userId: row.user_id,
            fullName: row.full_name,
            phone: row.phone,
            businessRole: row.business_role,
            proofImageUrl: row.proof_image_url,
            additionalNotes: row.additional_notes,
            status: row.status,
            reviewerId: row.reviewer_id,
            rejectionReason: row.rejection_reason,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}

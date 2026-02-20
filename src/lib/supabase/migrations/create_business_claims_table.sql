-- Create Business Claims Table
CREATE TABLE IF NOT EXISTS business_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text NOT NULL,
    business_role text NOT NULL, -- 'owner', 'manager', 'employee', 'marketing'
    proof_image_url text, -- URL to official document or proof
    additional_notes text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_id uuid REFERENCES auth.users(id),
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(place_id, user_id) -- Prevent duplicate pending/active claims from same user for same place
);

-- Enable RLS
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own claims"
    ON business_claims FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
    ON business_claims FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can do anything (assuming there's an admin role check)
CREATE POLICY "Admins can manage all claims"
    ON business_claims FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

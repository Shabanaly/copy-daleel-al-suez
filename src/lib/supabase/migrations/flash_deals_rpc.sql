-- Function to atomically increment flash deal claims
CREATE OR REPLACE FUNCTION increment_flash_deal_claims(p_deal_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE flash_deals
    SET current_claims = current_claims + 1
    WHERE id = p_deal_id
    AND status = 'active'
    AND (max_claims IS NULL OR current_claims < max_claims)
    AND end_date > now();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deal is not active or has reached maximum claims';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

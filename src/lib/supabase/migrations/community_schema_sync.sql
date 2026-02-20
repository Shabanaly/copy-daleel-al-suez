-- 1. ENHANCE community_questions TABLE
ALTER TABLE community_questions 
    ADD COLUMN IF NOT EXISTS body TEXT, -- Some versions might use 'content', the repository uses 'body'
    ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS has_accepted_answer BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS accepted_answer_id UUID, -- Will reference community_answers(id)
    ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

-- Rename 'content' to 'body' if it exists and 'body' doesn't have data
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_questions' AND column_name='content') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_questions' AND column_name='body') THEN
        ALTER TABLE community_questions RENAME COLUMN content TO body;
    END IF;
END $$;

-- 2. ENHANCE community_answers TABLE
ALTER TABLE community_answers
    ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_answers' AND column_name='content') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_answers' AND column_name='body') THEN
        ALTER TABLE community_answers RENAME COLUMN content TO body;
    END IF;
END $$;

-- 3. CREATE community_votes TABLE
CREATE TABLE IF NOT EXISTS community_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    votable_type TEXT NOT NULL CHECK (votable_type IN ('question', 'answer')),
    votable_id UUID NOT NULL,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, votable_type, votable_id)
);

-- 4. ENABLE RLS
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
-- Questions
DROP POLICY IF EXISTS "Anyone can view community questions" ON community_questions;
CREATE POLICY "Anyone can view community questions" ON community_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create questions" ON community_questions;
CREATE POLICY "Authenticated users can create questions" ON community_questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own questions" ON community_questions;
CREATE POLICY "Users can update their own questions" ON community_questions FOR UPDATE USING (auth.uid() = user_id);

-- Answers
DROP POLICY IF EXISTS "Anyone can view community answers" ON community_answers;
CREATE POLICY "Anyone can view community answers" ON community_answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create answers" ON community_answers;
CREATE POLICY "Authenticated users can create answers" ON community_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own answers" ON community_answers;
CREATE POLICY "Users can update their own answers" ON community_answers FOR UPDATE USING (auth.uid() = user_id);

-- Votes
DROP POLICY IF EXISTS "Users can view all votes" ON community_votes;
CREATE POLICY "Users can view all votes" ON community_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own votes" ON community_votes;
CREATE POLICY "Users can manage their own votes" ON community_votes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 6. RPC FUNCTIONS
-- Vote Community Function
CREATE OR REPLACE FUNCTION vote_community(
    p_type TEXT,
    p_id UUID,
    p_user_id UUID,
    p_vote TEXT
) RETURNS VOID AS $$
DECLARE
    v_diff INTEGER := 0;
    v_old_vote TEXT;
BEGIN
    -- Check for existing vote
    SELECT vote_type INTO v_old_vote FROM community_votes 
    WHERE user_id = p_user_id AND votable_type = p_type AND votable_id = p_id;

    IF v_old_vote IS NULL THEN
        -- New vote
        INSERT INTO community_votes (user_id, votable_type, votable_id, vote_type)
        VALUES (p_user_id, p_type, p_id, p_vote);
        v_diff := CASE WHEN p_vote = 'upvote' THEN 1 ELSE -1 END;
    ELSIF v_old_vote = p_vote THEN
        -- Remove vote
        DELETE FROM community_votes 
        WHERE user_id = p_user_id AND votable_type = p_type AND votable_id = p_id;
        v_diff := CASE WHEN p_vote = 'upvote' THEN -1 ELSE 1 END;
    ELSE
        -- Change vote
        UPDATE community_votes SET vote_type = p_vote 
        WHERE user_id = p_user_id AND votable_type = p_type AND votable_id = p_id;
        v_diff := CASE WHEN p_vote = 'upvote' THEN 2 ELSE -2 END;
    END IF;

    -- Update counts
    IF p_type = 'question' THEN
        UPDATE community_questions SET upvote_count = upvote_count + v_diff WHERE id = p_id;
    ELSE
        UPDATE community_answers SET upvote_count = upvote_count + v_diff WHERE id = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept Answer Function
CREATE OR REPLACE FUNCTION accept_answer(
    p_question_id UUID,
    p_answer_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Verify ownership of question
    IF EXISTS (SELECT 1 FROM community_questions WHERE id = p_question_id AND user_id = p_user_id) THEN
        -- Reset previous accepted answer
        UPDATE community_answers SET is_accepted = false WHERE question_id = p_question_id;
        -- Set new accepted answer
        UPDATE community_answers SET is_accepted = true WHERE id = p_answer_id;
        -- Update question state
        UPDATE community_questions SET 
            has_accepted_answer = true,
            accepted_answer_id = p_answer_id
        WHERE id = p_question_id;
    ELSE
        RAISE EXCEPTION 'Only the question owner can accept an answer';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update answer_count on questions
CREATE OR REPLACE FUNCTION update_question_answer_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE community_questions SET answer_count = answer_count + 1 WHERE id = NEW.question_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE community_questions SET answer_count = answer_count - 1 WHERE id = OLD.question_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_answer_count ON community_answers;
CREATE TRIGGER tr_update_answer_count
    AFTER INSERT OR DELETE ON community_answers
    FOR EACH ROW EXECUTE FUNCTION update_question_answer_count();

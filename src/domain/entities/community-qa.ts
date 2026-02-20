export interface CommunityAuthor {
    full_name: string;
    avatar_url?: string;
}

export type CommunityCategory =
    | 'places'
    | 'events'
    | 'general'
    | 'advice'
    | 'recommendations';

export interface CommunityQuestion {
    id: string;
    title: string;
    body: string;

    category: CommunityCategory;
    tags?: string[];

    user_id: string;

    view_count: number;
    answer_count: number;
    upvote_count: number;

    has_accepted_answer: boolean;
    accepted_answer_id?: string;

    is_closed: boolean;
    is_flagged: boolean;

    created_at: string;
    updated_at: string;
    author?: CommunityAuthor;
}

export interface CommunityAnswer {
    id: string;
    question_id: string;
    user_id: string;
    body: string;

    upvote_count: number;
    is_accepted: boolean;
    is_flagged: boolean;

    created_at: string;
    updated_at: string;
    author?: CommunityAuthor;
}

export interface CommunityVote {
    id: string;
    user_id: string;
    votable_type: 'question' | 'answer';
    votable_id: string;
    vote_type: 'upvote' | 'downvote';
    created_at: string;
}

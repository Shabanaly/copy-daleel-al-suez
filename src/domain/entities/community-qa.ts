export interface CommunityAuthor {
    full_name: string;
    avatar_url?: string;
    role?: 'user' | 'business_owner' | 'admin' | 'super_admin';
}

export type CommunityCategory =
    | 'places'
    | 'events'
    | 'general'
    | 'advice'
    | 'recommendations';

export interface CommunityQuestion {
    id: string;
    content: string;
    user_id: string;

    view_count: number;
    answers_count: number;
    votes_count: number;

    accepted_answer_id?: string;

    created_at: string;
    updated_at: string;
    author?: CommunityAuthor;
}

export interface CommunityAnswer {
    id: string;
    question_id: string;
    user_id: string;
    content: string;

    votes_count: number;
    is_accepted: boolean;

    created_at: string;
    updated_at: string;
    author?: CommunityAuthor;
}

export interface CommunityVote {
    id: string;
    user_id: string;
    votable_type: 'question' | 'answer';
    votable_id: string;
    created_at: string;
}

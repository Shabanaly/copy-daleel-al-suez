export interface Article {
    id: string;
    title: string;
    excerpt: string;
    content: string; // Rich text or Markdown
    cover_image_url: string;
    author_id: string;
    category: string; // 'News', 'Story', 'Article', etc.
    is_published: boolean;
    created_at: Date;
    updated_at: Date;
}

export type ArticleCategory = 'News' | 'Story' | 'Article' | 'Announcement';

export interface CreateArticleDTO {
    title: string;
    excerpt: string;
    content: string;
    cover_image_url: string;
    author_id: string;
    category: string;
    is_published: boolean;
}

export interface UpdateArticleDTO {
    id: string;
    title?: string;
    excerpt?: string;
    content?: string;
    cover_image_url?: string;
    category?: string;
    is_published?: boolean;
}

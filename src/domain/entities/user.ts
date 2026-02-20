export interface User {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    fullName?: string;
    avatarUrl?: string;

    // Extended Profile
    username?: string;
    bio?: string;
    phone?: string;
    points?: number;

    createdAt: string;
    updatedAt?: string;
}

'use client'

import { User, Mail, Calendar } from 'lucide-react'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface OverviewSectionProps {
    user: SupabaseUser
    isAdmin: boolean
}

export function OverviewSection({ user, isAdmin }: OverviewSectionProps) {
    return (
        <div className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold">معلومات الحساب</h3>

                <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-5 bg-card hover:bg-accent rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-xl group-hover:scale-110 transition-transform">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">الاسم</p>
                            <p className="font-medium text-foreground">
                                {user.user_metadata?.full_name || 'مستخدم دليل السويس'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-5 bg-card hover:bg-accent rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-xl group-hover:scale-110 transition-transform">
                            <Mail size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                            <p className="font-medium text-foreground">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-5 bg-card hover:bg-accent rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 text-primary rounded-xl group-hover:scale-110 transition-transform">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                            <p className="font-medium text-foreground">
                                {new Date(user.created_at).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

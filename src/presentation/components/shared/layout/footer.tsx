import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

interface SocialLink {
    platform: string;
    url: string;
}

export function Footer({ settings }: { settings?: Record<string, unknown> }) {
    return (
        <footer className="bg-slate-900 text-slate-200 py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">{(settings?.site_name as string) || "دليل السويس"}</h3>
                    <p className="text-sm text-slate-400">
                        {(settings?.site_description as string) || "الدليل الشامل لكل ما تحتاجة في مدينة السويس. مطاعم، كافيهات، خدمات، والمزيد."}
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">روابط سريعة</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/about" className="hover:text-primary transition-colors">عن الدليل</Link></li>
                        <li><Link href="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link></li>
                        <li><Link href="/profile?tab=support" className="hover:text-primary transition-colors">الدعم الفني</Link></li>
                        <li><Link href="/privacy" className="hover:text-primary transition-colors">سياسة الخصوصية</Link></li>
                        <li><Link href="/terms" className="hover:text-primary transition-colors">الشروط والأحكام</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">تصفح</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/places/restaurants" className="hover:text-primary transition-colors">مطاعم</Link></li>
                        <li><Link href="/places/cafes" className="hover:text-primary transition-colors">كافيهات</Link></li>
                        <li><Link href="/places/medical" className="hover:text-primary transition-colors">خدمات طبية</Link></li>
                        <li><Link href="/categories" className="hover:text-primary transition-colors">كل التصنيفات</Link></li>
                    </ul>
                </div>

                <div>
                    <div className="flex flex-wrap gap-3">
                        {settings?.social_links && Array.isArray(settings.social_links) ? (
                            (settings.social_links as SocialLink[]).map((link, index) => {
                                const PlatformIcon = () => {
                                    switch (link.platform?.toLowerCase()) {
                                        case 'facebook': return <Facebook size={20} />;
                                        case 'instagram': return <Instagram size={20} />;
                                        case 'twitter':
                                        case 'x': return <Twitter size={20} />;
                                        default: return null;
                                    }
                                };

                                if (!link.url) return null;

                                return (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors"
                                        title={link.platform}
                                    >
                                        <PlatformIcon />
                                    </a>
                                );
                            })
                        ) : (
                            // Fallback to old format or empty
                            <>
                                {settings?.social_facebook && (
                                    <a href={settings.social_facebook as string} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                        <Facebook size={20} />
                                    </a>
                                )}
                                {settings?.social_instagram && (
                                    <a href={settings.social_instagram as string} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {settings?.social_twitter && (
                                    <a href={settings.social_twitter as string} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors">
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {!settings?.social_facebook && !settings?.social_instagram && !settings?.social_twitter && (
                                    <span className="text-sm text-slate-500">لا توجد روابط</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} {(settings?.site_name as string) || "دليل السويس"}. جميع الحقوق محفوظة.</p>
            </div>
        </footer>
    )
}

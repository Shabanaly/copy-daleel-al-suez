import { getArticleByIdUseCase } from "@/di/modules";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Share2, Tag } from "lucide-react";
import { ArticleTracker } from "@/presentation/features/news/article-tracker";

interface PageProps {
    params: {
        id: string;
    };
}

export const revalidate = 3600;

import { createReadOnlyClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createReadOnlyClient();
    const article = await getArticleByIdUseCase.execute(id, supabase);

    if (!article) {
        return {
            title: 'المقال غير موجود',
        }
    }

    return {
        title: article.title,
        description: article.excerpt,
        openGraph: {
            title: article.title,
            description: article.excerpt,
            url: `/news/${article.id}`,
            siteName: 'دليل السويس',
            images: [
                {
                    url: article.cover_image_url || '/og-image.jpg', // Fallback image
                    width: 1200,
                    height: 630,
                    alt: article.title,
                }
            ],
            locale: 'ar_EG',
            type: 'article',
            publishedTime: new Date(article.created_at).toISOString(),
            modifiedTime: new Date(article.updated_at).toISOString(),
            authors: ['فريق تحرير دليل السويس'],
            section: article.category,
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.excerpt,
            images: [article.cover_image_url || '/og-image.jpg'],
        },
    }
}

export default async function ArticleDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createReadOnlyClient();
    const article = await getArticleByIdUseCase.execute(id, supabase);

    if (!article || !article.is_published) {
        notFound();
    }

    const { site_name, site_url } = { site_name: 'دليل السويس', site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dalil-al-suways.vercel.app' };

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        image: [article.cover_image_url],
        datePublished: article.created_at,
        dateModified: article.updated_at,
        author: [{
            '@type': 'Person',
            name: 'فريق تحرير دليل السويس', // Or author name if available
            url: site_url
        }],
        publisher: {
            '@type': 'Organization',
            name: site_name,
            logo: {
                '@type': 'ImageObject',
                url: `${site_url}/icon.png`
            }
        },
        description: article.excerpt
    };

    return (
        <article className="min-h-screen bg-background pb-24 transition-colors duration-300">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Image - Keep dark overlay for text readability on image */}
            <div className="relative h-[60vh] md:h-[70vh] w-full">
                {article.cover_image_url ? (
                    <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 md:via-black/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${article.category === 'News' ? 'bg-red-500 text-white' :
                        article.category === 'Story' ? 'bg-blue-500 text-white' :
                            article.category === 'Announcement' ? 'bg-orange-500 text-white' :
                                'bg-purple-500 text-white'
                        }`}>
                        {article.category === 'News' ? 'أخبار' :
                            article.category === 'Story' ? 'حكاية' :
                                article.category === 'Announcement' ? 'إعلان' :
                                    article.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground md:text-white mb-6 leading-tight">
                        {article.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-muted-foreground md:text-slate-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span dir="ltr" className="font-medium text-lg">
                                {new Date(article.created_at).toLocaleDateString("en-GB", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="bg-card backdrop-blur-md border border-border rounded-3xl p-6 md:p-12 max-w-4xl mx-auto shadow-xl">
                    {/* Excerpt */}
                    {article.excerpt && (
                        <p className="text-xl md:text-2xl text-card-foreground font-medium leading-relaxed mb-10 border-r-4 border-primary pr-6">
                            {article.excerpt}
                        </p>
                    )}

                    {/* Main Content */}
                    <div className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-none">
                        <div className="whitespace-pre-wrap font-sans">{article.content}</div>
                    </div>

                    {/* Share / Footer */}
                    <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="w-4 h-4" />
                            <span>
                                {article.category === 'News' ? 'أخبار' :
                                    article.category === 'Story' ? 'حكاية' :
                                        article.category === 'Announcement' ? 'إعلان' :
                                            article.category}
                            </span>
                        </div>
                        {/* Placeholder for share button */}
                        <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
                            <Share2 className="w-5 h-5" />
                            <span>مشاركة المقال</span>
                        </button>
                    </div>
                </div>
            </div>

            <ArticleTracker id={article.id} title={article.title} />
        </article>
    );
}

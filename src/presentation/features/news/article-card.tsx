import Link from "next/link";
import Image from "next/image";
import { Article } from "@/domain/entities/article";
import { Calendar, User, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
    article: Article;
    isCompact?: boolean;
}

export function ArticleCard({ article, isCompact = false }: ArticleCardProps) {
    // Simple reading time calculation
    const wordCount = (article.content || article.excerpt || "").split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const isBreaking = article.category === 'News' && (new Date().getTime() - new Date(article.created_at).getTime() < 24 * 60 * 60 * 1000);

    return (
        <Link
            href={`/news/${article.id}`}
            className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md h-full flex flex-col"
        >
            <div className={cn(
                "relative w-full overflow-hidden shrink-0",
                isCompact ? "h-32" : "h-48"
            )}>
                {article.cover_image_url ? (
                    <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-[10px]">لا توجد صورة</span>
                    </div>
                )}

                <div className={cn(
                    "absolute flex flex-col gap-2 items-end",
                    isCompact ? "top-2 right-2" : "top-3 right-3"
                )}>
                    <div className={cn(
                        "font-bold rounded-full backdrop-blur-md shadow-sm border border-white/10",
                        isCompact ? "px-2 py-0.5 text-[8px]" : "text-xs px-3 py-1",
                        article.category === 'News' ? 'bg-red-500/90 text-white' :
                            article.category === 'Story' ? 'bg-blue-500/90 text-white' :
                                article.category === 'Announcement' ? 'bg-orange-500/90 text-white' :
                                    'bg-purple-500/90 text-white'
                    )}>
                        {article.category === 'News' ? 'أخبار' :
                            article.category === 'Story' ? 'حكاية' :
                                article.category === 'Announcement' ? 'إعلان' :
                                    article.category}
                    </div>
                </div>
            </div>

            <div className={cn(
                "flex flex-col flex-1",
                isCompact ? "p-3" : "p-5"
            )}>
                <div className={cn(
                    "flex items-center justify-between font-bold text-muted-foreground uppercase tracking-wider",
                    isCompact ? "text-[8px] mb-1.5" : "text-[10px] mb-3"
                )}>
                    <div className="flex items-center gap-1">
                        <Calendar className={isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                        <span dir="ltr">{new Date(article.created_at).toLocaleDateString("en-GB")}</span>
                    </div>
                </div>

                <h3 className={cn(
                    "font-bold text-card-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors leading-tight",
                    isCompact ? "text-sm" : "text-xl mb-2"
                )}>
                    {article.title}
                </h3>

                {!isCompact && (
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-4">
                        {article.excerpt}
                    </p>
                )}

                <div className={cn(
                    "mt-auto flex items-center justify-between",
                    isCompact ? "pt-2 border-t border-border/30" : "pt-4 border-t border-border/50"
                )}>
                    <div className="flex items-center gap-1.5">
                        <div className={cn("rounded-full bg-primary/10 flex items-center justify-center", isCompact ? "w-4 h-4" : "w-6 h-6")}>
                            <User size={isCompact ? 8 : 12} className="text-primary" />
                        </div>
                        <span className={isCompact ? "text-[8px]" : "text-[10px] font-bold"}>دليل السويس</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

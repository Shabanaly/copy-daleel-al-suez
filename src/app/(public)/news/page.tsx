import { getArticlesUseCase } from "@/di/modules";
import { ArticleCard } from "@/presentation/features/news/article-card";

export const revalidate = 3600; // 1 hour

import { createClient } from "@/lib/supabase/server";

export default async function NewsPage() {
    const supabase = await createClient();
    const articles = await getArticlesUseCase.execute(50, 0, supabase); // Fetch latest 50 for now

    return (
        <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="pt-32 pb-12 px-4 container mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-4">
                    أخبار وحكايات <span className="text-primary">السويس</span>
                </h1>
                <p className="text-muted-foreground text-center max-w-2xl mx-auto text-lg">
                    تابع آخر الأخبار، الأحداث، والحكايات التاريخية عن مدينتنا الجميلة.
                </p>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4">
                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted">
                        <p className="text-muted-foreground text-lg">لا توجد مقالات منشورة حالياً.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

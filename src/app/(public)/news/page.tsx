import { getArticlesAction } from "@/actions/news.actions";
import { ArticleCard } from "@/presentation/features/news/article-card";
import { Pagination } from "@/presentation/components/shared/pagination";

export const revalidate = 3600; // 1 hour

interface NewsPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
    const { page: pageParam } = await searchParams
    const page = parseInt(pageParam || '1')
    const limit = 12
    const offset = (page - 1) * limit

    const { articles, count } = await getArticlesAction(limit, offset);
    const totalPages = Math.ceil(count / limit)

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
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    baseUrl="/news"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-muted">
                        <p className="text-muted-foreground text-lg">لا توجد مقالات منشورة حالياً.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

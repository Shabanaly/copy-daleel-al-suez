import Link from "next/link";
import { Article } from "@/domain/entities/article";
import { ArticleCard } from "./article-card";
import { HorizontalScroll } from "@/presentation/components/shared/ui/horizontal-scroll";

interface HomeNewsSectionProps {
    articles: Article[];
}

export function HomeNewsSection({ articles }: HomeNewsSectionProps) {
    if (!articles || articles.length === 0) return null;

    return (
        <HorizontalScroll
            title="أحدث ما كُتب عن السويس"
            subtitle="أخبار، حكايات، ومقالات تهمك"
            viewAllLink="/news"
        >
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} isCompact />
            ))}
        </HorizontalScroll>
    );
}

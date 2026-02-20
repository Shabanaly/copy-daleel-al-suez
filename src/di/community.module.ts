import { SupabaseEventRepository } from "@/data/repositories/supabase-event.repository";
import { GetActiveEventsUseCase } from "@/domain/use-cases/get-active-events.usecase";
import { GetEventByIdUseCase } from "@/domain/use-cases/get-event-by-id.usecase";
import { SupabaseArticleRepository } from "@/data/repositories/supabase-article-repository";
import { GetArticlesUseCase } from "@/domain/use-cases/get-articles.usecase";
import { GetArticleByIdUseCase } from "@/domain/use-cases/get-article-by-id.usecase";
import { GetLatestArticlesUseCase } from "@/domain/use-cases/get-latest-articles.usecase";

// 1. Repositories
export const eventRepository = new SupabaseEventRepository();
export const articleRepository = new SupabaseArticleRepository();

// 2. Use Cases
export const getActiveEventsUseCase = new GetActiveEventsUseCase(eventRepository);
export const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository);
export const getArticlesUseCase = new GetArticlesUseCase(articleRepository);
export const getArticleByIdUseCase = new GetArticleByIdUseCase(articleRepository);
export const getLatestArticlesUseCase = new GetLatestArticlesUseCase(articleRepository);

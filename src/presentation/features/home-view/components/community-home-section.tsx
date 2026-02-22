import { CommunityQuestion } from "@/domain/entities/community-qa";
import { QuestionCard } from "@/presentation/features/community/components/question-card";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/presentation/ui/button";

interface CommunityHomeSectionProps {
    questions: CommunityQuestion[];
}

export function CommunityHomeSection({ questions }: CommunityHomeSectionProps) {
    if (!questions || questions.length === 0) return null;

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl opacity-50" />

            <div className="container mx-auto px-4 relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
                            <MessageSquare size={14} />
                            مجتمع السويس
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground">
                            اسأل واستفسر من <span className="text-secondary">أهالي بلدك</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            تواصل مع سكان مدينة السويس، احصل على نصائح، وشارك تجاربك مع الآخرين في مجتمع تفاعلي آمن.
                        </p>
                    </div>

                    <Link href="/community">
                        <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold gap-2 group border-2">
                            تصفح كل الأسئلة
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map((question, index) => (
                        <QuestionCard key={question.id} question={question} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

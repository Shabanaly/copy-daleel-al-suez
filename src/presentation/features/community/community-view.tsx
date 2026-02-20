'use client'

import { useState, useEffect } from "react"
import { CommunityQuestion, CommunityCategory } from "@/domain/entities/community-qa"
import { getQuestionsAction } from "@/actions/community.actions"
import { QuestionCard } from "./components/question-card"
import { CategoryFilters } from "./components/category-filters"
import { AskQuestionModal } from "./components/ask-question-modal"
import { Input } from "@/presentation/ui/input"
import { Button } from "@/presentation/ui/button"
import { Search, Plus, MessageSquare, Loader2, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CommunityView() {
    const [questions, setQuestions] = useState<CommunityQuestion[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState<CommunityCategory | 'all'>('all')
    const [isAskModalOpen, setIsAskModalOpen] = useState(false)

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const data = await getQuestionsAction({
                category: activeCategory === 'all' ? undefined : activeCategory,
                search: searchQuery || undefined
            })
            setQuestions(data)
        } catch (error) {
            console.error("Fetch questions error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [activeCategory])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchQuestions()
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl md:text-4xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    >
                        مجتمع السويس
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground font-medium"
                    >
                        شارك، استفسر، وساعد الآخرين في مدينتنا الجميلة.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={() => setIsAskModalOpen(true)}
                        className="rounded-2xl h-14 px-8 font-bold text-lg gap-2 shadow-xl shadow-primary/20 w-full md:w-auto"
                    >
                        <Plus size={20} strokeWidth={3} />
                        طرح سؤال جديد
                    </Button>
                </motion.div>
            </div>

            {/* Controls Section */}
            <div className="space-y-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1 group">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <Input
                            placeholder="ابحث في أسئلة المجتمع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-14 pr-12 rounded-2xl border-border/50 bg-card hover:border-primary/30 focus-visible:ring-primary shadow-sm transition-all"
                        />
                    </form>

                    <CategoryFilters
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                        <div className="relative">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <MessageSquare className="absolute inset-0 m-auto w-4 h-4 text-primary" />
                        </div>
                        <p className="text-muted-foreground font-bold animate-pulse">جاري تحميل الأسئلة...</p>
                    </motion.div>
                ) : questions.length > 0 ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {questions.map((q, idx) => (
                            <QuestionCard key={q.id} question={q} index={idx} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-muted/20 rounded-[32px] border-2 border-dashed border-border/50"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-background flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <MessageSquare size={40} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">لا توجد أسئلة بعد</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                            كن أول من يطرح سؤالاً في هذا التصنيف وساعد في بناء مجتمعنا.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setIsAskModalOpen(true)}
                            className="rounded-xl font-bold gap-2 px-6"
                        >
                            ابدأ أنت الآن
                            <Plus size={16} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feature Tip */}
            {!loading && questions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-4 text-center md:text-right"
                >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Info className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-1 text-lg">نصيحة للمجتمع</h4>
                        <p className="text-sm text-primary/70 leading-relaxed">
                            الأجوبة الدقيقة تساعد أصحاب المحلات والخدمات على تحسين جودتهم. لا تتردد في الإجابة على ما تعرفه!
                        </p>
                    </div>
                </motion.div>
            )}

            <AskQuestionModal
                isOpen={isAskModalOpen}
                onClose={() => {
                    setIsAskModalOpen(false)
                    fetchQuestions()
                }}
            />
        </div>
    )
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowLeft, Zap } from 'lucide-react';
import { SpyEngine, UserProfile } from '@/lib/user-spy/spy-engine';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AssistantMessage {
    id: string;
    text: string;
    actionLabel?: string;
    actionHref?: string;
    type: 'article' | 'interest' | 'market' | 'greeting';
    isHighPriority?: boolean;
}

const COOLDOWN_KEY = 'smart_assistant_cooldown';
const SESSION_COUNT_KEY = 'smart_assistant_session_count';
const LAST_TYPE_KEY = 'smart_assistant_last_type';

type AssistantMessageType = AssistantMessage['type'];

interface AssistantCandidate extends AssistantMessage {
    baseScore: number;
    type: AssistantMessageType;
}

const INTEREST_LABELS: Record<string, string> = {
    // Marketplace
    'market_vehicles': 'عروض سيارات وإكسسوارات',
    'market_electronics': 'إلكترونيات وأجهزة',
    'market_home': 'أثاث ولوازم منزلية',
    'market_fashion': 'ملابس وإكسسوارات',
    'market_food': 'منتجات أكل وشرب',
    // Places / categories
    'restaurants': 'مطاعم',
    'cafes': 'كافيهات',
    'gyms': 'جيم ولياقة',
    'education': 'تعليم ودروس',
    'shopping': 'تسوق ومولات',
};

export function SmartAssistant() {
    const pathname = usePathname();
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [message, setMessage] = useState<AssistantMessage | null>(null);
    const [isHubVisible, setIsHubVisible] = useState(false);

    const resolveInterestLabel = useCallback((key: string) => {
        if (INTEREST_LABELS[key]) return INTEREST_LABELS[key];

        if (key.startsWith('market_')) {
            const raw = key.replace('market_', '');
            return `عروض في ${raw.replace(/_/g, ' ')}`;
        }

        return key.replace(/_/g, ' ');
    }, []);

    const buildCandidates = useCallback((profile: UserProfile): AssistantCandidate[] => {
        const candidates: AssistantCandidate[] = [];

        const articles = Object.values(profile.unfinishedArticles);
        if (articles.length > 0) {
            const latest = articles.sort((a, b) => b.timestamp - a.timestamp)[0];
            candidates.push({
                id: `article_${latest.id}`,
                text: `لسه مكملتش قراءة خبر "${latest.title}".. تحب نكمّل من آخر حتة؟`,
                actionLabel: 'كمّل القراءة',
                actionHref: `/news/${latest.id}`,
                type: 'article',
                isHighPriority: true,
                baseScore: 100,
            });
        }

        const topInterest = SpyEngine.getTopInterest();
        if (topInterest) {
            const interest = profile.interests[topInterest];
            if (interest && interest.score >= 2) {
                const readableName = resolveInterestLabel(topInterest);
                const isMarket = topInterest.startsWith('market_');

                candidates.push({
                    id: `interest_${topInterest}`,
                    text: `واضح إنك بتحب ${readableName}.. حابب تشوف حاجات ممكن تعجبك أكتر؟`,
                    actionLabel: isMarket ? 'شوف العروض' : 'استكشف',
                    actionHref: isMarket ? '/marketplace' : `/categories/${topInterest}`,
                    type: isMarket ? 'market' : 'interest',
                    isHighPriority: false,
                    baseScore: 80,
                });
            }
        }

        if (profile.archetypes.includes('foodie')) {
            candidates.push({
                id: 'archetype_foodie',
                text: 'يا أكيل! في مطاعم وكافيهات شكلها هيعجبك جدًا.. نجرب تشوف حاجة جديدة النهاردة؟',
                actionLabel: 'شوف المطاعم والكافيهات',
                actionHref: '/categories/restaurants',
                type: 'interest',
                isHighPriority: false,
                baseScore: 70,
            });
        }

        if (profile.visitCount < 3 || Object.keys(profile.interests).length === 0) {
            const options = [
                {
                    text: 'أهلاً بك في دليل السويس! تحب نوريك أكتر الأماكن اللي الناس بتزورها اليوم؟',
                    label: 'شوف الرائج',
                    href: '/places?sort=trending',
                },
                {
                    text: 'لسه جديد هنا؟ نقدر نلفّفك على أهم أقسام الدليل في ثواني.',
                    label: 'استكشف الدليل',
                    href: '/categories',
                },
                {
                    text: 'بدل ما تدور كتير.. شوف أحدث الأماكن اللي انضمت لينا النهاردة!',
                    label: 'شوف الجديد',
                    href: '/places?sort=newest',
                },
            ];
            const random = options[Math.floor(Math.random() * options.length)];
            candidates.push({
                id: 'discovery',
                text: random.text,
                actionLabel: random.label,
                actionHref: random.href,
                type: 'greeting',
                isHighPriority: false,
                baseScore: 40,
            });
        }

        return candidates;
    }, [resolveInterestLabel]);

    const pickBestCandidate = useCallback((candidates: AssistantCandidate[]): AssistantMessage | null => {
        if (candidates.length === 0) return null;

        let best = candidates[0];
        let bestScore = best.baseScore;

        const lastType = sessionStorage.getItem(LAST_TYPE_KEY) as AssistantMessageType | null;

        candidates.forEach((candidate) => {
            let score = candidate.baseScore;

            if (candidate.isHighPriority) {
                score += 15;
            }

            if (candidate.type === 'greeting') {
                score -= 10;
            }

            if (lastType && candidate.type === lastType) {
                score -= 15;
            }

            const jitter = Math.random() * 6 - 3;
            score += jitter;

            if (score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        });

        sessionStorage.setItem(LAST_TYPE_KEY, best.type);

        const { baseScore, ...message } = best;
        return message;
    }, []);

    const generateSmartMessage = useCallback((profile: UserProfile): AssistantMessage | null => {
        const candidates = buildCandidates(profile);
        return pickBestCandidate(candidates);
    }, [buildCandidates, pickBestCandidate]);

    // Effect for showing the hub after a short delay
    useEffect(() => {
        const timer = setTimeout(() => setIsHubVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Effect for re-checking smart messages on navigation
    useEffect(() => {
        const checkIntelligence = () => {
            SpyEngine.incrementVisitCount();
            const profile = SpyEngine.getProfile();
            const smartMsg = generateSmartMessage(profile);

            if (smartMsg) {
                setMessage(smartMsg);

                // Auto-open logic
                try {
                    const cooldown = sessionStorage.getItem(COOLDOWN_KEY);
                    const now = Date.now();
                    const sessionCount = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0');

                    if (cooldown && now - parseInt(cooldown) < 5 * 60 * 1000) return;
                    if (sessionCount >= 3) return;

                    const delay = smartMsg.isHighPriority ? 2500 : 8000;
                    const timer = setTimeout(() => {
                        setIsMessageOpen(true);
                        sessionStorage.setItem(SESSION_COUNT_KEY, (sessionCount + 1).toString());
                    }, delay);

                    return () => clearTimeout(timer);
                } catch {
                    // sessionStorage may be unavailable; in that case, avoid auto-opening to stay safe
                    return;
                }
            }
        };

        const timer = setTimeout(checkIntelligence, 1000);
        return () => clearTimeout(timer);
    }, [pathname, generateSmartMessage]);

    const handleClose = () => {
        setIsMessageOpen(false);
        try {
            sessionStorage.setItem(COOLDOWN_KEY, Date.now().toString());
        } catch {
            // ignore if sessionStorage is unavailable
        }
    };

    if (!isHubVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[100] flex flex-col items-end gap-3 pointer-events-none" dir="rtl">
            <AnimatePresence>
                {isMessageOpen && message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                        className="pointer-events-auto max-w-[240px] md:max-w-[280px] bg-card/80 backdrop-blur-xl border border-primary/20 shadow-[0_20px_50px_rgba(0,102,204,0.15)] rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 space-y-3" dir="rtl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    <div className="bg-primary/10 p-1 rounded-lg">
                                        <Sparkles size={14} className="animate-pulse" />
                                    </div>
                                    <span className="text-[11px] font-black uppercase tracking-wider">المنارة الذكية</span>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-1 hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <p className="text-[13px] md:text-sm font-bold leading-relaxed text-foreground/90">
                                {message.text}
                            </p>

                            {message.actionHref && (
                                <Link
                                    href={message.actionHref}
                                    onClick={() => setIsMessageOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-xl text-[11px] md:text-xs font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    {message.actionLabel}
                                    <ArrowLeft size={14} />
                                </Link>
                            )}
                        </div>

                        {/* Suez Identity Digital Beam */}
                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-40"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Floating Hub Icon */}
            <div className="relative pointer-events-auto">
                <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-full animate-pulse md:animate-[pulse_2.5s_ease-in-out_infinite]"></div>

                <motion.button
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMessageOpen(!isMessageOpen)}
                    className="relative w-11 h-11 md:w-14 md:h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center group overflow-hidden border-2 border-white/20 dark:border-primary/30"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent transition-opacity group-hover:opacity-50"></div>
                    <Zap size={22} className="relative z-10 drop-shadow-md md:size-24" />

                    <span className="absolute inset-0 rounded-full border border-primary/50 animate-ping opacity-20 md:border-2"></span>
                    <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </motion.button>
            </div>
        </div>
    );
}

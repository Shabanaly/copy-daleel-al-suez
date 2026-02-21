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

export function SmartAssistant() {
    const pathname = usePathname();
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [message, setMessage] = useState<AssistantMessage | null>(null);
    const [isHubVisible, setIsHubVisible] = useState(false);

    const generateSmartMessage = useCallback((profile: UserProfile): AssistantMessage | null => {
        // 1. Check for unfinished articles (Priority)
        const articles = Object.values(profile.unfinishedArticles);
        if (articles.length > 0) {
            const latest = articles.sort((a, b) => b.timestamp - a.timestamp)[0];
            return {
                id: `article_${latest.id}`,
                text: `لسه مكملتش قراءة خبر "${latest.title}".. تحب ترجع له؟`,
                actionLabel: 'كمل قراءة',
                actionHref: `/news/${latest.id}`,
                type: 'article',
                isHighPriority: true
            };
        }

        // 2. Strong interests
        const topInterest = SpyEngine.getTopInterest();
        if (topInterest && profile.interests[topInterest].score >= 2) {
            const readableName = topInterest.replace('market_', 'دليل السوق - ');
            return {
                id: `interest_${topInterest}`,
                text: `شكلك مهتم بـ ${readableName}.. في حاجات جديدة لقطة نزلت، بص عليها!`,
                actionLabel: 'استكشف',
                actionHref: topInterest.startsWith('market_') ? '/marketplace' : `/categories/${topInterest}`,
                type: 'interest',
                isHighPriority: false
            };
        }

        // 3. Archetype suggestion
        if (profile.archetypes.includes('foodie')) {
            return {
                id: 'archetype_foodie',
                text: 'يا أكيل! في مطاعم وكافيهات جديدة انضمت للدليل.. جرب حاجة مختلفة النهاردة؟',
                actionLabel: 'شوف المطاعم',
                actionHref: '/categories/restaurants',
                type: 'interest',
                isHighPriority: false
            };
        }

        // 4. Discovery Mode (Fallback for new users)
        if (profile.visitCount < 3 || Object.keys(profile.interests).length === 0) {
            const options = [
                { text: 'أهلاً بك في دليل السويس! تحب تشوف الأماكن الأكثر رواقاً النهاردة؟', label: 'شوف الرائج', href: '/places/trending' },
                { text: 'لسه جديد هنا؟ استكشف أقسام الدليل وشوف كل اللي السويس بتقدمه.', label: 'استكشف الدليل', href: '/categories' },
                { text: 'بدل الحيرة.. شوف أحدث الأماكن اللي انضمت لينا النهاردة!', label: 'شوف الجديد', href: '/places?sort=newest' }
            ];
            const random = options[Math.floor(Math.random() * options.length)];
            return {
                id: 'discovery',
                text: random.text,
                actionLabel: random.label,
                actionHref: random.href,
                type: 'greeting',
                isHighPriority: false
            };
        }

        // 5. Random "Try Something New" for idle users
        if (Math.random() > 0.7) {
            return {
                id: 'random_discovery',
                text: 'ما تيجي نجرب حاجة جديدة؟ استكشف أماكن عشوائية ممكن تعجبك!',
                actionLabel: 'جرب حظك',
                actionHref: '/places/random',
                type: 'greeting',
                isHighPriority: false
            };
        }

        return null;
    }, []);

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
                const cooldown = sessionStorage.getItem(COOLDOWN_KEY);
                const now = Date.now();
                const sessionCount = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0');

                if (cooldown && now - parseInt(cooldown) < 5 * 60 * 1000) return;
                if (sessionCount >= 3) return;

                const delay = smartMsg.isHighPriority ? 3000 : 10000;
                const timer = setTimeout(() => {
                    setIsMessageOpen(true);
                    sessionStorage.setItem(SESSION_COUNT_KEY, (sessionCount + 1).toString());
                }, delay);

                return () => clearTimeout(timer);
            }
        };

        const timer = setTimeout(checkIntelligence, 1000);
        return () => clearTimeout(timer);
    }, [pathname, generateSmartMessage]);

    const handleClose = () => {
        setIsMessageOpen(false);
        sessionStorage.setItem(COOLDOWN_KEY, Date.now().toString());
    };

    if (!isHubVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-end gap-3 pointer-events-none" dir="rtl">
            <AnimatePresence>
                {isMessageOpen && message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
                        className="pointer-events-auto max-w-[280px] bg-card/80 backdrop-blur-xl border border-primary/20 shadow-[0_20px_50px_rgba(0,102,204,0.15)] rounded-2xl overflow-hidden"
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

                            <p className="text-sm font-bold leading-relaxed text-foreground/90">
                                {message.text}
                            </p>

                            {message.actionHref && (
                                <Link
                                    href={message.actionHref}
                                    onClick={() => setIsMessageOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95"
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

            {/* The Floating Hub Icon - Enhanced with Glow */}
            <div className="relative pointer-events-auto">
                {/* Exterior Glow Aura */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMessageOpen(!isMessageOpen)}
                    className="relative w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center group overflow-hidden border-2 border-white/20 dark:border-primary/30"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent transition-opacity group-hover:opacity-50"></div>
                    <Zap size={24} className="relative z-10 drop-shadow-md" />

                    {/* Infinite Pulse Ring */}
                    <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-20"></span>
                    <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </motion.button>
            </div>
        </div>
    );
}

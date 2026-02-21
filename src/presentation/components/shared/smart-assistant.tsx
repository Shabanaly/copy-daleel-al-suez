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
}

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
                text: `لسه مكملتش قراءة خبر "${latest.title}"، تحب ترجع له؟`,
                actionLabel: 'كمل قراءة',
                actionHref: `/news/${latest.id}`,
                type: 'article'
            };
        }

        // 2. Check for strong interests (Threshold lowered to 2 for better visibility)
        const topInterest = SpyEngine.getTopInterest();
        if (topInterest && profile.interests[topInterest].score >= 2) {
            const readableName = topInterest.replace('market_', 'دليل السوق - ');
            return {
                id: `interest_${topInterest}`,
                text: `شكلك مهتم بـ ${readableName}.. في حاجات جديدة لقطة نزلت، بص عليها!`,
                actionLabel: 'استكشف',
                actionHref: topInterest.startsWith('market_') ? '/marketplace' : `/categories/${topInterest}`,
                type: 'interest'
            };
        }

        // 3. Fallback greeting if they have any activity
        if (profile.viewedPlaces.length > 0 || Object.keys(profile.interests).length > 0) {
            return {
                id: 'greeting',
                text: 'أهلاً بك مرة تانية.. دليلك بيتحسن كل ما بتستخدمه أكتر! محتاج مساعدة في حاجة؟',
                actionLabel: 'شوف الجديد',
                actionHref: '/places?sort=newest',
                type: 'greeting'
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
            const profile = SpyEngine.getProfile();
            const smartMsg = generateSmartMessage(profile);

            if (smartMsg) {
                setMessage(smartMsg);
                // Auto-open message bubble on route change if it's new
                setIsMessageOpen(true);
            }
        };

        // Delay slightly to ensure storage is updated by hooks
        const timer = setTimeout(checkIntelligence, 1000);
        return () => clearTimeout(timer);
    }, [pathname, generateSmartMessage]);

    if (!isHubVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence>
                {isMessageOpen && message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20, x: 20 }}
                        className="pointer-events-auto max-w-[280px] bg-white dark:bg-slate-900 border border-border shadow-2xl rounded-2xl overflow-hidden"
                    >
                        <div className="p-4 space-y-3" dir="rtl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles size={16} className="animate-pulse" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">المنارة الذكية</span>
                                </div>
                                <button
                                    onClick={() => setIsMessageOpen(false)}
                                    className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <p className="text-sm font-medium leading-relaxed text-foreground">
                                {message.text}
                            </p>

                            {message.actionHref && (
                                <Link
                                    href={message.actionHref}
                                    onClick={() => setIsMessageOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                >
                                    {message.actionLabel}
                                    <ArrowLeft size={14} />
                                </Link>
                            )}
                        </div>

                        {/* Digital Beam Effect */}
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Floating Hub Icon */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMessageOpen(!isMessageOpen)}
                className="pointer-events-auto w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center relative group overflow-hidden border-4 border-white dark:border-slate-800"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent transition-opacity group-hover:opacity-40"></div>
                <Zap size={24} className="relative z-10" />

                {/* Pulse Aura */}
                <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping"></span>
            </motion.button>
        </div>
    );
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createReadOnlyClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/utils/sanitize'
import { SupabaseCommunityRepository } from '@/data/repositories/supabase-community.repository'
import { CommunityCategory, CommunityQuestion } from '@/domain/entities/community-qa'
import { createNotificationAction } from './notifications.actions'
import { unstable_cache } from 'next/cache'
import { cache as reactCache } from 'react'

async function getCommunityRepository() {
    const supabase = await createClient()
    return new SupabaseCommunityRepository(supabase)
}

export async function getQuestionsAction(filters?: {
    search?: string;
    sortBy?: 'newest' | 'votes' | 'unanswered';
}, client?: any) {
    const supabase = client || await createClient()
    const repository = new SupabaseCommunityRepository(supabase)
    try {
        return await repository.getQuestions(filters)
    } catch (error) {
        console.error('getQuestionsAction error:', error)
        return []
    }
}

export const getQuestionByIdAction = reactCache(async (id: string) => {
    const supabase = await createReadOnlyClient()
    const repository = new SupabaseCommunityRepository(supabase)
    try {
        return await repository.getQuestionById(id)
    } catch (error) {
        console.error('getQuestionByIdAction error:', error)
        return null
    }
})

export const getAnswersAction = reactCache(async (questionId: string) => {
    const supabase = await createReadOnlyClient()
    const repository = new SupabaseCommunityRepository(supabase)
    try {
        return await repository.getAnswers(questionId)
    } catch (error) {
        console.error('getAnswersAction error:', error)
        return []
    }
})

export async function submitQuestionAction(data: {
    content: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول لطرح سؤال')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        const content = sanitizeText(data.content)
        if (content.length < 10) throw new Error('السؤال قصير جداً، يجب أن يكون 10 أحرف على الأقل')
        if (content.length > 2000) throw new Error('السؤال طويل جداً، الحد الأقصى 2000 حرف')

        const question = await repository.createQuestion({ ...data, content }, user.id)
        revalidatePath('/community')
        return { success: true, question }
    } catch (error) {
        console.error('submitQuestionAction error:', error)
        // Preserve validation error messages for user feedback
        if (error instanceof Error && (error.message.includes('قصير') || error.message.includes('طويل') || error.message.includes('يجب'))) {
            throw error
        }
        throw new Error('فشل طرح السؤال')
    }
}

// --- Cached Data Wrappers ---

export const getCachedQuestions = async (filters?: {
    search?: string;
    sortBy?: 'newest' | 'votes' | 'unanswered';
}) => {
    return await unstable_cache(
        async () => {
            const supabase = await createReadOnlyClient()
            const repository = new SupabaseCommunityRepository(supabase)
            return await repository.getQuestions(filters)
        },
        ['community-questions', JSON.stringify(filters || {})],
        { revalidate: 60, tags: ['community', 'community_questions'] }
    )()
}

export async function submitAnswerAction(questionId: string, body: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول للإجابة')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        const content = sanitizeText(body)
        if (content.length < 5) throw new Error('الإجابة قصيرة جداً، يجب أن تكون 5 أحرف على الأقل')
        if (content.length > 5000) throw new Error('الإجابة طويلة جداً، الحد الأقصى 5000 حرف')

        const answer = await repository.createAnswer(questionId, content, user.id)

        // Notify question owner
        const question = await repository.getQuestionById(questionId)
        if (question && question.user_id !== user.id) {
            await createNotificationAction({
                userId: question.user_id,
                title: 'إجابة جديدة على سؤالك',
                message: `قام ${user.user_metadata?.full_name || 'مستخدم'} بالرد على سؤالك: ${question.content}`,
                type: 'community_answer',
                data: {
                    questionId,
                    answerId: answer.id,
                    url: `/community/${questionId}`
                }
            })
        }

        revalidatePath(`/community/${questionId}`)
        return { success: true, answer }
    } catch (error) {
        console.error('submitAnswerAction error:', error)
        // Preserve validation error messages for user feedback
        if (error instanceof Error && (error.message.includes('قصير') || error.message.includes('طويل') || error.message.includes('يجب'))) {
            throw error
        }
        throw new Error('فشل إضافة الإجابة')
    }
}

export async function voteAction(type: 'question' | 'answer', id: string, voteType: 'upvote' | 'downvote') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول للتصويت')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        await repository.vote(type, id, user.id, voteType)
        // Redirection or revalidation path depends on context
        // If it's a detail page, revalidate it. If it's a list, revalidate community
        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error('voteAction error:', error)
        throw new Error('فشل التصويت')
    }
}

export async function acceptAnswerAction(questionId: string, answerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        await repository.acceptAnswer(questionId, answerId, user.id)

        // Notify answer owner
        const answers = await repository.getAnswers(questionId)
        const acceptedAnswer = answers.find(a => a.id === answerId)
        if (acceptedAnswer && acceptedAnswer.user_id !== user.id) {
            const question = await repository.getQuestionById(questionId)
            await createNotificationAction({
                userId: acceptedAnswer.user_id,
                title: 'تم قبول إجابتك',
                message: `لقد تم اختيار إجابتك كأفضل إجابة على السؤال: ${question?.content}`,
                type: 'community_accept',
                data: {
                    questionId,
                    answerId,
                    url: `/community/${questionId}`
                }
            })
        }

        revalidatePath(`/community/${questionId}`)
        return { success: true }
    } catch (error) {
        console.error('acceptAnswerAction error:', error)
        throw new Error('فشل قبول الإجابة')
    }
}

export async function deleteQuestionAction(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        await repository.deleteQuestion(id, user.id)
        revalidatePath('/community')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('deleteQuestionAction error:', error)
        throw new Error('فشل حذف السؤال')
    }
}

export async function updateQuestionAction(id: string, updates: { content?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        await repository.updateQuestion(id, user.id, updates)
        revalidatePath(`/community/${id}`)
        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error('updateQuestionAction error:', error)
        throw new Error('فشل تحديث السؤال')
    }
}

export async function deleteAnswerAction(questionId: string, answerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول')

    console.log(`[Action] deleteAnswerAction start: questionId=${questionId}, answerId=${answerId}, userId=${user.id}`);

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        await repository.deleteAnswer(answerId, user.id)
        revalidatePath(`/community/${questionId}`)
        console.log('[Action] deleteAnswerAction success');
        return { success: true }
    } catch (error: any) {
        console.error('[Action] deleteAnswerAction error:', error)
        return { success: false, error: error.message || 'فشل حذف الإجابة' }
    }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SupabaseCommunityRepository } from '@/data/repositories/supabase-community.repository'
import { CommunityCategory, CommunityQuestion } from '@/domain/entities/community-qa'
import { createNotificationAction } from './notifications.actions'

async function getCommunityRepository() {
    const supabase = await createClient()
    return new SupabaseCommunityRepository(supabase)
}

export async function getQuestionsAction(filters?: {
    search?: string;
    sortBy?: 'newest' | 'votes' | 'unanswered';
}) {
    const repository = await getCommunityRepository()
    try {
        return await repository.getQuestions(filters)
    } catch (error) {
        console.error('getQuestionsAction error:', error)
        return []
    }
}

export async function getQuestionByIdAction(id: string) {
    const repository = await getCommunityRepository()
    try {
        return await repository.getQuestionById(id)
    } catch (error) {
        console.error('getQuestionByIdAction error:', error)
        return null
    }
}

export async function submitQuestionAction(data: {
    content: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول لطرح سؤال')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        const question = await repository.createQuestion(data, user.id)
        revalidatePath('/community')
        return { success: true, question }
    } catch (error) {
        console.error('submitQuestionAction error:', error)
        throw new Error('فشل طرح السؤال')
    }
}

export async function getAnswersAction(questionId: string) {
    const repository = await getCommunityRepository()
    try {
        return await repository.getAnswers(questionId)
    } catch (error) {
        console.error('getAnswersAction error:', error)
        return []
    }
}

export async function submitAnswerAction(questionId: string, body: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('يجب تسجيل الدخول للإجابة')

    const repository = new SupabaseCommunityRepository(supabase)
    try {
        const answer = await repository.createAnswer(questionId, body, user.id)

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

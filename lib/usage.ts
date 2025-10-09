import { prisma } from "./db"

interface PlanLimits {
    meetings: number
    chatMessages: number
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
    premium: { meetings: -1, chatMessages: -1 }
}

export async function canUserSendBot(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) {
        return { allowed: false, reason: 'User not found' }
    }

    // All users have unlimited access now
    return { allowed: true }
}

export async function canUserChat(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        return { allowed: false, reason: 'user not found' }
    }

    // All users have unlimited access now
    return { allowed: true }
}

export async function incrementMeetingUsage(userId: string) {
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            meetingsThisMonth: {
                increment: 1
            }
        }
    })
}

export async function incrementChatUsage(userId: string) {
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            chatMessagesToday: {
                increment: 1
            }
        }
    })
}

export function getPlanLimits(plan: string): PlanLimits {
    return PLAN_LIMITS[plan] || PLAN_LIMITS.premium
}

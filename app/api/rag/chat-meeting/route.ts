import { chatWithMeeting } from "@/lib/rag";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { meetingId, question } = await request.json()

    console.log('Chat request body:', {
        meetingId: meetingId ? 'present' : 'missing',
        question: question ? 'present' : 'missing'
    })

    if (!meetingId || !question) {
        return NextResponse.json({
            error: 'Missing meetingId or question',
            received: { meetingId: !!meetingId, question: !!question }
        }, { status: 400 })
    }

    try {
        const response = await chatWithMeeting(userId, meetingId, question)

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error in chat:', error)

        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
                return NextResponse.json({
                    error: 'OpenAI API key is invalid or expired. Please check your API key configuration.',
                    details: 'API key authentication failed'
                }, { status: 500 })
            }
        }

        return NextResponse.json({ error: 'Failed to process question' }, { status: 500 })
    }
}

import { generateMeetingTitle } from "@/lib/ai-processor";
import { prisma } from "@/lib/db";
import { AppError, ErrorCode, ErrorMessages, createErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { generateRequestId } from "@/lib/request-context";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const requestId = generateRequestId();
    const startTime = performance.now();

    try {
        logger.info('meetings_past_request_received', {
            requestId,
            endpoint: '/api/meetings/past',
            method: 'GET',
        });

        const { userId } = await auth();
        if (!userId) {
            logger.warn('meetings_past_not_authenticated', { requestId });
            return NextResponse.json(
                createErrorResponse(
                    new AppError(ErrorMessages.NOT_AUTHENTICATED),
                    requestId
                ),
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            logger.warn('meetings_past_user_not_found', { requestId, userId });
            // Auto-create user if they don't exist (Clerk webhook may not have fired)
            try {
                const newUser = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: `${userId}@placeholder.com`,
                    }
                });
                logger.info('meetings_past_user_auto_created', { requestId, userId, newUserId: newUser.id });
                // Return empty meetings for newly created user
                return NextResponse.json({
                    meetings: [],
                    count: 0
                });
            } catch (createError) {
                logger.error('meetings_past_user_auto_create_failed', createError, { requestId, userId });
                // Create a user not found error
                const userNotFoundError = new AppError({
                    code: ErrorCode.NOT_AUTHENTICATED,
                    message: 'User not found in database',
                    userMessage: 'User profile not found. Please try signing out and signing in again.',
                    statusCode: 404,
                });
                return NextResponse.json(
                    createErrorResponse(userNotFoundError, requestId),
                    { status: 404 }
                );
            }
        }

        logger.info('meetings_past_lookup', {
            requestId,
            userId,
            dbUserId: user.id,
        });

        console.log('Fetching past meetings for user:', user.id);

        // Performance: Optimized query with pagination
        const pastMeetings = await prisma.meeting.findMany({
            where: {
                userId: user.id,
                // Show meetings that have ended OR have transcripts
                OR: [
                    { meetingEnded: true },
                    { transcriptReady: true }
                ]
            },
            orderBy: {
                endTime: 'desc'
            },
            take: 5, // Reduced from 10 to 5 for faster loading
            skip: 0, // For pagination: calculate from query param
            select: {
                // Only select needed fields to reduce payload
                id: true,
                title: true,
                description: true,
                meetingUrl: true,
                startTime: true,
                endTime: true,
                attendees: true,
                transcriptReady: true,
                recordingUrl: true,
                speakers: true,
                transcript: true,
                summary: true,
                actionItems: true
            }
        });

        console.log('Found past meetings:', pastMeetings.length, pastMeetings);

        // Generate titles for meetings that need them (on-the-fly)
        const meetingsWithGeneratedTitles = await Promise.all(
            pastMeetings.map(async (meeting) => {
                // Check if title needs to be generated
                const needsGeneratedTitle = !meeting.title ||
                    meeting.title.trim() === '' ||
                    meeting.title === 'Untitled Meeting' ||
                    meeting.title.startsWith('Meeting ');

                if (needsGeneratedTitle && meeting.transcript) {
                    try {
                        const generatedTitle = await generateMeetingTitle(meeting.transcript);
                        return {
                            ...meeting,
                            title: generatedTitle,
                            titleGenerated: true // Flag to indicate title was generated on-the-fly
                        };
                    } catch (error) {
                        console.error('Error generating title for meeting:', meeting.id, error);
                        return meeting;
                    }
                }
                return meeting;
            })
        );

        const duration = performance.now() - startTime;
        logger.info('meetings_past_success', {
            requestId,
            userId,
            count: pastMeetings.length,
            duration: Math.round(duration),
        });

        // Performance: Add cache headers for client-side caching
        const response = NextResponse.json({
            meetings: meetingsWithGeneratedTitles,
            count: meetingsWithGeneratedTitles.length
        });

        // Cache for 60 seconds on CDN/client
        response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        response.headers.set('X-Request-Id', requestId);
        response.headers.set('X-Response-Time', `${Math.round(duration)}ms`);

        return response;

    } catch (error) {
        const duration = performance.now() - startTime;
        logger.error('meetings_past_unexpected_error', error, {
            requestId,
            duration: Math.round(duration),
        });

        const appError = new AppError(ErrorMessages.DATABASE_ERROR);
        const res = NextResponse.json(
            createErrorResponse(appError, requestId),
            { status: appError.statusCode }
        );
        res.headers.set('X-Request-Id', requestId);
        return res;
    }
}

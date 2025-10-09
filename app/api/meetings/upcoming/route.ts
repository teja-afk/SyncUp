import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { syncCalendarEventsToDatabase } from "@/lib/integrations/google/calendar"

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const now = new Date()
        let upcomingMeetings = await prisma.meeting.findMany({
            where: {
                userId: user.id,
                startTime: { gte: now },
                isFromCalendar: true
            },
            orderBy: { startTime: 'asc' },
            take: 10
        })

        // If user is connected but no upcoming meetings, try to sync from calendar
        if (user.calenderConnected && user.googleAccessToken && upcomingMeetings.length === 0) {
            try {
                console.log('No upcoming meetings found, syncing from Google Calendar...')
                await syncCalendarEventsToDatabase(userId)

                // Fetch meetings again after sync
                upcomingMeetings = await prisma.meeting.findMany({
                    where: {
                        userId: user.id,
                        startTime: { gte: now },
                        isFromCalendar: true
                    },
                    orderBy: { startTime: 'asc' },
                    take: 10
                })
            } catch (syncError) {
                console.error('Error syncing calendar events:', syncError)
                // Continue with empty results if sync fails
            }
        }

        const events = upcomingMeetings.map(meeting => ({
            id: meeting.calendarEventId || meeting.id,
            summary: meeting.title,
            start: { dateTime: meeting.startTime.toISOString() },
            end: { dateTime: meeting.endTime.toISOString() },
            attendees: meeting.attendees ? JSON.parse(meeting.attendees as string) : [],
            hangoutLink: meeting.meetingUrl,
            conferenceData: meeting.meetingUrl ? { entryPoints: [{ uri: meeting.meetingUrl }] } : null,
            botScheduled: meeting.botScheduled,
            meetingId: meeting.id
        }))

        return NextResponse.json({
            events,
            connected: user.calenderConnected,
            source: 'database'
        })

    } catch (error) {
        console.error('Error fetching meetings:', error)
        return NextResponse.json({
            error: "Failed to fetch meetings",
            events: [],
            connected: false
        }, { status: 500 })
    }
}

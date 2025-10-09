import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const {
            title,
            startTime,
            endTime,
            meetingUrl,
            description,
            attendees,
            calendarEventId
        } = await request.json();

        // Validate required fields
        if (!title || !startTime || !endTime) {
            return NextResponse.json({
                error: "Missing required fields: title, startTime, endTime"
            }, { status: 400 });
        }

        // Create the meeting
        const meeting = await prisma.meeting.create({
            data: {
                userId: user.id,
                title,
                description,
                meetingUrl,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                attendees: attendees ? (attendees as any) : undefined,
                calendarEventId,
                isFromCalendar: !!calendarEventId,
                botScheduled: true, // Enable bot by default
                meetingEnded: false,
                transcriptReady: false,
            }
        });

        return NextResponse.json({
            success: true,
            meeting,
            message: "Meeting created successfully"
        });

    } catch (error) {
        console.error("Error creating meeting:", error);
        return NextResponse.json({
            error: "Failed to create meeting"
        }, { status: 500 });
    }
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(`Fixing audio URLs for user: ${user.id}`);

    // Find all meetings with the old S3 audio URL
    const meetingsToUpdate = await prisma.meeting.findMany({
      where: {
        userId: user.id,
        recordingUrl: "https://meetingbot1.s3.eu-north-1.amazonaws.com/test-audio.mp3"
      }
    });

    console.log(`Found ${meetingsToUpdate.length} meetings to update`);

    // Update each meeting to use the local audio file
    const updatedMeetings = [];
    for (const meeting of meetingsToUpdate) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          recordingUrl: "/test-audio.mp3"
        }
      });

      updatedMeetings.push({
        id: meeting.id,
        title: meeting.title
      });

      console.log(`Updated meeting: ${meeting.title} (ID: ${meeting.id})`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedMeetings.length} meetings to use local audio file`,
      updatedMeetings
    });

  } catch (error) {
    console.error("Error fixing audio URLs:", error);
    return NextResponse.json(
      {
        error: "Failed to fix audio URLs",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

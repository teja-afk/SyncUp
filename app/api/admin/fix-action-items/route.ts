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

    console.log(`Fixing action items structure for user: ${user.id}`);

    // Find all meetings that might have string arrays instead of object arrays for action items
    const meetingsToCheck = await prisma.meeting.findMany({
      where: {
        userId: user.id
      }
    });

    console.log(`Found ${meetingsToCheck.length} meetings to check`);

    const fixedMeetings = [];

    for (const meeting of meetingsToCheck) {
      if (meeting.actionItems) {
        try {
          const actionItems = meeting.actionItems;

          // Check if actionItems is an array of strings (wrong format)
          if (Array.isArray(actionItems) && actionItems.length > 0 && typeof actionItems[0] === 'string') {
            console.log(`Fixing action items for meeting: ${meeting.title}`);

            // Convert string array to object array with proper IDs
            const fixedActionItems = actionItems.map((text, index) => ({
              id: `${meeting.id}_action_${index + 1}`,
              text: text
            }));

            await prisma.meeting.update({
              where: { id: meeting.id },
              data: {
                actionItems: fixedActionItems
              }
            });

            fixedMeetings.push({
              id: meeting.id,
              title: meeting.title,
              actionItemsCount: fixedActionItems.length
            });

            console.log(`✅ Fixed ${fixedActionItems.length} action items for: ${meeting.title}`);
          }
        } catch (error) {
          console.error(`❌ Error fixing action items for meeting ${meeting.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully fixed action items structure for ${fixedMeetings.length} meetings`,
      fixedMeetings
    });

  } catch (error) {
    console.error("Error fixing action items:", error);
    return NextResponse.json(
      {
        error: "Failed to fix action items",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

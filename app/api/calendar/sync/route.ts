import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncCalendarEventsToDatabase } from "@/lib/integrations/google/calendar";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Sync calendar events to database
    await syncCalendarEventsToDatabase(userId);

    return NextResponse.json({
      success: true,
      message: "Calendar events synced successfully"
    });

  } catch (error) {
    console.error("Error syncing calendar events:", error);

    return NextResponse.json(
      {
        error: "Failed to sync calendar events",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

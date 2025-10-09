import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { refreshGoogleTokenIfNeeded } from "@/lib/integrations/refreshTokenIfNeeded";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                calenderConnected: true,
                googleAccessToken: true,
                googleRefreshToken: true,
                googleTokenExpiry: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Try to refresh the Google token if needed
        const refreshResult = await refreshGoogleTokenIfNeeded(userId);

        // Check current connection status
        const isConnected = user.calenderConnected && !!user.googleAccessToken;

        return NextResponse.json({
            success: true,
            connected: isConnected,
            refreshed: refreshResult.success,
            message: isConnected
                ? "Calendar is connected"
                : "Calendar connection needs to be re-established"
        });

    } catch (error) {
        console.error("Error refreshing calendar:", error);
        return NextResponse.json({
            error: "Failed to refresh calendar connection",
            connected: false
        }, { status: 500 });
    }
}

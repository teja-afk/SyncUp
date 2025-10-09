import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { refreshGoogleTokenIfNeeded } from "@/lib/integrations/refreshTokenIfNeeded";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ connected: false });
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
            select: {
                calenderConnected: true,
                googleAccessToken: true,
                googleRefreshToken: true,
                googleTokenExpiry: true,
            },
        });

        if (!user) {
            return NextResponse.json({ connected: false });
        }

        // Try to refresh token if user has a refresh token
        if (user.googleRefreshToken && user.calenderConnected) {
            try {
                await refreshGoogleTokenIfNeeded(userId);
                // Refetch user data after potential refresh
                const refreshedUser = await prisma.user.findUnique({
                    where: { clerkId: userId },
                    select: {
                        calenderConnected: true,
                        googleAccessToken: true,
                    },
                });
                return NextResponse.json({
                    connected: refreshedUser?.calenderConnected && !!refreshedUser.googleAccessToken,
                });
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Fall back to original logic
            }
        }

        return NextResponse.json({
            connected: user.calenderConnected && !!user.googleAccessToken,
        });
    } catch (error) {
        console.error('Calendar status check error:', error);
        return NextResponse.json({ connected: false });
    }
}

import { prisma } from "@/lib/db";

export async function refreshGoogleToken(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                googleRefreshToken: true,
                googleTokenExpiry: true,
            }
        });

        if (!user?.googleRefreshToken) {
            throw new Error('No refresh token available');
        }

        // Check if token needs refresh (within 5 minutes of expiry)
        const now = new Date();
        const expiresAt = user.googleTokenExpiry;
        const needsRefresh = !expiresAt || now >= new Date(expiresAt.getTime() - 5 * 60 * 1000);

        if (!needsRefresh) {
            return user;
        }

        console.log('Refreshing Google token for user:', userId);

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                refresh_token: user.googleRefreshToken,
                grant_type: "refresh_token",
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokens.access_token) {
            throw new Error('Failed to refresh Google token');
        }

        // Update user with new token
        await prisma.user.update({
            where: { clerkId: userId },
            data: {
                googleAccessToken: tokens.access_token,
                googleTokenExpiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            },
        });

        console.log('Google token refreshed successfully');
        return { success: true };

    } catch (error) {
        console.error('Error refreshing Google token:', error);
        throw error;
    }
}

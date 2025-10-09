import { UserIntegration } from "@prisma/client";
import { refreshAsanaToken } from "./asana/refreshToken";
import { refreshJiraToken } from "./jira/refreshToken";
import { refreshGoogleToken } from "./google/refreshToken";

export async function refreshTokenIfNeeded(integration: UserIntegration) {
    const now = new Date()
    const expiresAt = integration.expiresAt

    if (!expiresAt || now >= new Date(expiresAt.getTime() - 5 * 60 * 1000)) {
        switch (integration.platform) {
            case 'jira':
                return await refreshJiraToken(integration)
            case 'asana':
                return await refreshAsanaToken(integration)
            default:
                return integration
        }
    }

    return integration
}

// Separate function for Google token refresh since it uses User model, not UserIntegration
export async function refreshGoogleTokenIfNeeded(userId: string) {
    try {
        await refreshGoogleToken(userId);
        return { success: true };
    } catch (error) {
        console.error('Failed to refresh Google token:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

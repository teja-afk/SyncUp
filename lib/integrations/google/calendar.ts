import { prisma } from "@/lib/db";
import { refreshGoogleTokenIfNeeded } from "@/lib/integrations/refreshTokenIfNeeded";

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  location?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
}

export async function fetchGoogleCalendarEvents(userId: string): Promise<GoogleCalendarEvent[]> {
  try {
    // Refresh token if needed
    await refreshGoogleTokenIfNeeded(userId);

    // Get user's Google tokens
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        googleAccessToken: true,
        googleTokenExpiry: true,
      }
    });

    if (!user?.googleAccessToken) {
      throw new Error('No Google access token available');
    }

    // Calculate time range (next 30 days)
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Fetch events from Google Calendar API
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${now.toISOString()}&` +
      `timeMax=${future.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime&` +
      `maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${user.googleAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();

    return data.items || [];
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}

export async function syncCalendarEventsToDatabase(userId: string): Promise<void> {
  try {
    const events = await fetchGoogleCalendarEvents(userId);

    // Get user ID from clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Process each event
    for (const event of events) {
      const startTime = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date
          ? new Date(event.start.date + 'T00:00:00Z')
          : new Date();

      const endTime = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date
          ? new Date(event.end.date + 'T23:59:59Z')
          : new Date(startTime.getTime() + 60 * 60 * 1000);

      // Skip events that have already ended
      if (endTime <= new Date()) {
        continue;
      }

      // Check if event already exists
      const existingMeeting = await prisma.meeting.findFirst({
        where: {
          userId: user.id,
          calendarEventId: event.id,
        }
      });

      if (existingMeeting) {
        // Update existing meeting
        await prisma.meeting.update({
          where: { id: existingMeeting.id },
          data: {
            title: event.summary || 'Untitled Event',
            startTime,
            endTime,
            meetingUrl: event.hangoutLink || null,
            attendees: event.attendees ? JSON.stringify(event.attendees) : undefined,
            isFromCalendar: true,
          }
        });
      } else {
        // Create new meeting
        await prisma.meeting.create({
          data: {
            userId: user.id,
            title: event.summary || 'Untitled Event',
            startTime,
            endTime,
            meetingUrl: event.hangoutLink || null,
            attendees: event.attendees ? JSON.stringify(event.attendees) : undefined,
            calendarEventId: event.id,
            isFromCalendar: true,
            botScheduled: true,
          }
        });
      }
    }

    console.log(`Synced ${events.length} calendar events for user ${userId}`);
  } catch (error) {
    console.error('Error syncing calendar events to database:', error);
    throw error;
  }
}

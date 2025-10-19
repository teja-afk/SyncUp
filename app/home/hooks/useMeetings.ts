import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export interface ConferenceData {
    conferenceId?: string;
    entryPoints?: Array<{
        entryPointType?: string;
        uri?: string;
        meetingCode?: string;
        passcode?: string;
    }>;
    conferenceSolution?: {
        key?: {
            type?: string;
        };
        name?: string;
        iconUri?: string;
    };
}

export interface CalendarEvent {
    id: string
    summary?: string
    start?: {
        dateTime?: string
        date?: string
    }
    attendees?: Array<{ email: string }>
    location?: string
    hangoutLink?: string
    conferenceData?: ConferenceData
    botScheduled?: boolean
    meetingId?: string
}

export interface AttendeeInfo {
    email?: string;
    name?: string;
    responseStatus?: string;
}

export interface PastMeeting {
    id: string
    title: string
    description?: string | null
    meetingUrl: string | null
    startTime: Date
    endTime: Date
    attendees?: AttendeeInfo[] | string
    transcriptReady: boolean
    recordingUrl?: string | null
    speakers?: string[] | string
}

export function useMeetings() {
    const { userId } = useAuth()
    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
    const [pastMeetings, setPastMeetings] = useState<PastMeeting[]>([])
    const [loading, setLoading] = useState(false)
    const [pastLoading, setPastLoading] = useState(false)
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState<string>('')
    const [botToggles, setBotToggles] = useState<{ [key: string]: boolean }>({})
    const [initialLoading, setInitialLoading] = useState(true)


    useEffect(() => {
        if (userId) {
            fetchUpcomingEvents()
            fetchPastMeetings()
        }
    }, [userId])

    const fetchUpcomingEvents = async () => {
        setLoading(true)
        setError('')

        try {
            const statusResponse = await fetch('/api/user/calendar-status')
            const statusData = await statusResponse.json()

            if (!statusData.connected) {
                setConnected(false)
                setUpcomingEvents([])
                setError('Calendar not connected for auto-sync. Connect to enable auto syncing.')
                setLoading(false)
                setInitialLoading(false)
                return
            }

            const response = await fetch('/api/meetings/upcoming')
            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Failed to fetch meetings')
                setConnected(false)
                setInitialLoading(false)
                return
            }

            setUpcomingEvents(result.events as CalendarEvent[])
            setConnected(result.connected)

            const toggles: { [key: string]: boolean } = {}
            result.events.forEach((event: CalendarEvent) => {
                toggles[event.id] = event.botScheduled ?? true
            })

            setBotToggles(toggles)

        } catch (error) {
            setError("failed to fetch calnedar events. please try agan")
            setConnected(false)
        }

        setLoading(false)
        setInitialLoading(false)

    }

    const fetchPastMeetings = async () => {

        setPastLoading(true)
        try {
            const response = await fetch('/api/meetings/past')
            const result = await response.json()

            if (!response.ok) {
                console.error('failed to fetch past meetings:', result.error)
                return
            }

            if (result.error) {
                return
            }
            setPastMeetings(result.meetings as PastMeeting[])
        } catch (error) {
            console.error('faild to fetch past meetings:', error)
        }
        setPastLoading(false)
    }

    const toggleBot = async (eventId: string) => {
        try {
            const event = upcomingEvents.find(e => e.id === eventId)
            if (!event?.meetingId) {
                return
            }

            setBotToggles(prev => ({
                ...prev,
                [eventId]: !prev[eventId]
            }))

            const response = await fetch(`/api/meetings/${event.meetingId}/bot-toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botScheduled: !botToggles[eventId]
                })
            })

            if (!response.ok) {
                setBotToggles(prev => ({
                    ...prev,
                    [eventId]: !prev[eventId]
                }))
            }
        } catch {
            setBotToggles(prev => ({
                ...prev,
                [eventId]: !prev[eventId]
            }))
        }
    }

    const directOAuth = async () => {
        setLoading(true)
        try {
            window.location.href = '/api/auth/google/direct-connect'
        } catch {
            setError('Failed to start direct OAuth')
            setLoading(false)
        }
    }

    const refreshCalendar = async () => {
        setLoading(true)
        setError('')

        try {
            // First sync calendar events
            const syncResponse = await fetch('/api/calendar/sync', {
                method: 'POST'
            })

            if (!syncResponse.ok) {
                const syncError = await syncResponse.json()
                setError(syncError.error || 'Failed to sync calendar')
                setLoading(false)
                return
            }

            // Then refresh the upcoming events
            await fetchUpcomingEvents()
        } catch (error) {
            setError('Failed to refresh calendar events')
            setLoading(false)
        }
    }

    const getAttendeeList = (attendees: unknown): string[] => {
        if (!attendees) {
            return []
        }

        try {
            const parsed = JSON.parse(String(attendees))
            if (Array.isArray(parsed)) {
                return parsed.map(name => String(name).trim())
            }
            return [String(parsed).trim()]
        } catch {
            const attendeeString = String(attendees)
            return attendeeString.split(',').map(name => name.trim()).filter(Boolean)
        }
    }

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return {
        userId,
        upcomingEvents,
        pastMeetings,
        loading,
        pastLoading,
        connected,
        error,
        botToggles,
        initialLoading,
        fetchUpcomingEvents,
        fetchPastMeetings,
        toggleBot,
        directOAuth,
        refreshCalendar,
        getAttendeeList,
        getInitials
    }

}

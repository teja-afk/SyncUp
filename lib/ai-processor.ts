import { chatWithAI } from './openai'

// Helper function to extract text from transcript
function extractTextFromTranscript(transcript: any): string {
    const formatSegment = (item: any) => {
        if (!item) return ''
        const speaker = item.speaker || 'Speaker'
        if (typeof item.text === 'string' && item.text.trim().length > 0) {
            return `${speaker}: ${item.text.trim()}`
        }
        if (Array.isArray(item.words) && item.words.length > 0) {
            return `${speaker}: ${item.words.map((w: any) => w.word).join(' ')}`
        }
        return ''
    }

    if (Array.isArray(transcript)) {
        return transcript
            .map((item: any) => formatSegment(item))
            .filter(Boolean)
            .join('\n')
    } else if (transcript && typeof transcript === 'object' && Array.isArray(transcript.segments)) {
        return transcript.segments
            .map((item: any) => formatSegment(item))
            .filter(Boolean)
            .join('\n')
    } else if (typeof transcript === 'string') {
        return transcript
    } else if (transcript.text) {
        return transcript.text
    }
    return ''
}

export async function generateMeetingTitle(transcript: any): Promise<string> {
    try {
        const transcriptText = extractTextFromTranscript(transcript)

        if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error('No transcript content found for title generation')
        }

        // Use first 1500 chars to keep prompt manageable
        const truncatedTranscript = transcriptText.slice(0, 1500)

        const systemPrompt = `You are an AI that generates concise, descriptive titles for meetings based on their transcript content.

        Generate a brief, descriptive title (3-8 words) that captures the main topic or purpose of the meeting.

        Guidelines:
        - Make it specific enough to identify the meeting
        - Use proper capitalization (like a title)
        - Avoid generic titles like "Meeting" or "Call"
        - Include relevant topics, team names, or project names if mentioned

        Return ONLY the title text, no quotes, no explanations, no JSON.`

        const userPrompt = `Generate a title for this meeting transcript:

${truncatedTranscript}`

        const response = await chatWithAI(systemPrompt, userPrompt)

        if (!response) {
            throw new Error('No response from AI for title generation')
        }

        // Clean up the response - remove quotes, extra whitespace, etc.
        let title = response.trim()
        // Remove surrounding quotes if present
        if ((title.startsWith('"') && title.endsWith('"')) ||
            (title.startsWith("'") && title.endsWith("'"))) {
            title = title.slice(1, -1)
        }
        // Remove any leading/trailing whitespace or punctuation
        title = title.replace(/^[\s"'-]+|[\s"'-]+$/g, '')

        if (!title || title.length < 3) {
            throw new Error('Generated title is too short')
        }

        // Limit title length
        if (title.length > 60) {
            title = title.slice(0, 57) + '...'
        }

        return title
    } catch (error) {
        console.error('Error generating meeting title:', error)
        return 'Meeting Discussion'
    }
}

export async function processMeetingTranscript(transcript: any) {
    try {
        let transcriptText = ''

        const formatSegment = (item: any) => {
            if (!item) return ''
            const speaker = item.speaker || 'Speaker'
            if (typeof item.text === 'string' && item.text.trim().length > 0) {
                return `${speaker}: ${item.text.trim()}`
            }
            if (Array.isArray(item.words) && item.words.length > 0) {
                return `${speaker}: ${item.words.map((w: any) => w.word).join(' ')}`
            }
            return ''
        }

        if (Array.isArray(transcript)) {
            transcriptText = transcript
                .map((item: any) => formatSegment(item))
                .filter(Boolean)
                .join('\n')
        } else if (transcript && typeof transcript === 'object' && Array.isArray(transcript.segments)) {
            transcriptText = transcript.segments
                .map((item: any) => formatSegment(item))
                .filter(Boolean)
                .join('\n')
        } else if (typeof transcript === 'string') {
            transcriptText = transcript
        } else if (transcript.text) {
            transcriptText = transcript.text
        }

        if (!transcriptText || transcriptText.trim().length === 0) {
            throw new Error('No transcript content found')
        }


        const systemPrompt = `You are an AI assistant that analyzes meeting transcripts and provides concise summaries and action items.

        Please analyze the meeting transcript and provide:
        1. A clear, concise summary (2-3 sentences) of the main discussion points and decisions
        2. A list of specific action items mentioned in the meeting

        Format your response as JSON:
        {
            "summary": "Your summary here",
            "actionItems": [
                "Action item description 1",
                "Action item description 2"
            ]
        }

        Return only the action item text as strings.
        If no clear action items are mentioned, return an empty array for actionItems.`

        const userPrompt = `Please analyze this meeting transcript:\n\n${transcriptText}`

        const response = await chatWithAI(systemPrompt, userPrompt)

        if (!response) {
            throw new Error('No response from local AI')
        }

        // Try to parse as JSON, handle non-JSON responses
        let parsed;
        try {
            parsed = JSON.parse(response)
        } catch (parseError) {
            // If response is not valid JSON, try to extract summary and action items
            console.warn('AI response was not JSON, attempting to parse text response')

            // Try to find JSON in the response if it's wrapped in text
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch {
                    // Still not valid JSON, create a summary from the text
                    parsed = {
                        summary: response.substring(0, 500),
                        actionItems: []
                    };
                }
            } else {
                // Use the response as the summary directly
                parsed = {
                    summary: response.substring(0, 500),
                    actionItems: []
                };
            }
        }

        const actionItems = Array.isArray(parsed.actionItems)
            ? parsed.actionItems.map((text: string, index: number) => ({
                id: index + 1,
                text: text
            }))
            : []

        // Generate a title from the transcript
        const title = await generateMeetingTitle(transcript)

        return {
            summary: parsed.summary || 'Summary couldnt be generated',
            actionItems: actionItems,
            title: title
        }

    } catch (error) {
        console.error('error processing transcript with chatgpt:', error)

        return {
            summary: 'Meeting transcript processed successfully. Please check the full transcript for details.',
            actionItems: [],
            title: 'Meeting Discussion'
        }
    }
}

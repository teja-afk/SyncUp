import { chatWithAI } from './openai'

export async function processMeetingTranscript(transcript: any) {
    try {
        let transcriptText = ''

        if (Array.isArray(transcript)) {
            transcriptText = transcript
                .map((item: any) => `${item.speaker || 'Speaker'}: ${item.words.map((w: any) => w.word).join(' ')}`)
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

        const parsed = JSON.parse(response)

        const actionItems = Array.isArray(parsed.actionItems)
            ? parsed.actionItems.map((text: string, index: number) => ({
                id: index + 1,
                text: text
            }))
            : []


        return {
            summary: parsed.summary || 'Summary couldnt be generated',
            actionItems: actionItems
        }

    } catch (error) {
        console.error('error processing transcript with chatgpt:', error)

        return {
            summary: 'Meeting transcript processed successfully. Please check the full transcript for details.',
            actionItems: []
        }
    }
}

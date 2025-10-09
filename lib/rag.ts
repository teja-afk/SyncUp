import { prisma } from "./db";
import { chatWithAI, createEmbedding, createManyEmbeddings } from "./openai";
import { saveManyVectors, searchVectors } from "./pinecone";
import { chunkTranscript, extractSpeaker } from "./text-chunker";

export async function processTranscript(
    meetingId: string,
    userId: string,
    transcript: string,
    meetingTitle?: string
) {
    const chunks = chunkTranscript(transcript)

    const texts = chunks.map(chunk => chunk.content)

    const embeddings = await createManyEmbeddings(texts)

    const dbChunks = chunks.map((chunk) => ({
        meetingId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        speakerName: extractSpeaker(chunk.content),
        vectorId: `${meetingId}_chunk_${chunk.chunkIndex}`
    }))

    await prisma.transcriptChunk.createMany({
        data: dbChunks,
        skipDuplicates: true
    })

    const vectors = chunks.map((chunk, index) => ({
        id: `${meetingId}_chunk_${chunk.chunkIndex}`,
        embedding: embeddings[index],
        metadata: {
            meetingId,
            userId,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            speakerName: extractSpeaker(chunk.content),
            meetingTitle: meetingTitle || 'Untitled Meeting'

        }
    }))

    await saveManyVectors(vectors)
}

export async function chatWithMeeting(
    userId: string,
    meetingId: string,
    question: string
) {
    const questionEmbedding = await createEmbedding(question)

    const results = await searchVectors(
        questionEmbedding,
        { userId, meetingId },
        5
    )

    const meeting = await prisma.meeting.findUnique({
        where: {
            id: meetingId
        }
    })

    const context = results
        .map(result => {
            const speaker = result.metadata?.speakerName || 'Unknown'
            const content = result.metadata?.content || ''
            return `${speaker}: ${content}`
        })
        .join('\n\n')

    const systemPrompt = `You are helping someone understand their meeting.
    Meeting: ${meeting?.title || 'Untitled Meeting'}
    Date: ${meeting?.createdAt ? new Date(meeting.createdAt).toDateString() : 'Unknown'}

    Here's what was discussed:
    ${context}

    Answer the user's question based only on the meeting content above. If the answer isn't in the meeting, say so`

    const answer = await chatWithAI(systemPrompt, question)

    return {
        answer,
        sources: results.map(result => ({
            meetingId: result.metadata?.meetingId,
            content: result.metadata?.content,
            speakerName: result.metadata?.speakerName,
            confidence: result.score
        }))
    }
}

export async function chatWithAllMeetings(
    userId: string,
    question: string
) {
    try {
        const questionEmbedding = await createEmbedding(question)

        const results = await searchVectors(
            questionEmbedding,
            { userId },
            8
        )

        // If no results found, return a helpful message
        if (!results || results.length === 0) {
            return {
                answer: "I couldn't find any relevant information in your meetings to answer this question. This might be because your meetings haven't been processed for AI search yet, or the information isn't available in your meeting transcripts.",
                sources: []
            }
        }

        const context = results
            .map(result => {
                const meetingTitle = result.metadata?.meetingTitle || 'Untitled Meeting'
                const speaker = result.metadata?.speakerName || 'Unknown'
                const content = result.metadata?.content || ''
                return `Meeting: ${meetingTitle}\n${speaker}: ${content}`
            })
            .join('\n\n---\n\n')

        const systemPrompt = `You are helping someone understand their meeting history.

        Here's what was discussed across their meetings:
        ${context}

        Answer the user's question based only on the meeting content above. When you reference something, mention which meetings its from.`

        const answer = await chatWithAI(systemPrompt, question)

        return {
            answer,
            sources: results.map(result => ({
                meetingId: result.metadata?.meetingId,
                meetingTitle: result.metadata?.meetingTitle,
                content: result.metadata?.content,
                speakerName: result.metadata?.speakerName,
                confidence: result.score
            }))
        }
    } catch (error) {
        console.error('Error in chatWithAllMeetings:', error)

        // Return a graceful error response instead of crashing
        return {
            answer: "I encountered an error while searching your meetings. This might be because the AI services aren't fully configured yet. Please try again later or contact support if the issue persists.",
            sources: []
        }
    }
}

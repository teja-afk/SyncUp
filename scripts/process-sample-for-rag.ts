#!/usr/bin/env tsx

/**
 * Process Sample Meeting for RAG
 *
 * This script processes the sample meeting data directly for RAG without requiring authentication.
 * Run with: npx tsx scripts/process-sample-for-rag.ts
 */

import { config } from 'dotenv'
import { prisma } from '../lib/db'
import { processTranscript } from '../lib/rag'

// Load environment variables
config()

async function main() {
    console.log('🔄 Processing sample meeting for RAG...')

    try {
        // Find the sample meeting we created
        const sampleMeeting = await prisma.meeting.findFirst({
            where: {
                title: {
                    contains: 'Q4 Product Planning Meeting'
                }
            }
        })

        if (!sampleMeeting) {
            console.log('❌ No sample meeting found. Please run the seed script first:')
            console.log('   npx tsx scripts/seed-sample-meeting.ts')
            return
        }

        console.log(`✅ Found meeting: ${sampleMeeting.title}`)
        console.log(`📝 Meeting ID: ${sampleMeeting.id}`)

        // Check if already processed (but we'll reprocess to ensure vectors are in Pinecone)
        if (sampleMeeting.ragProcessed) {
            console.log('🔄 Meeting was marked as processed, but reprocessing to ensure vectors are in Pinecone...')
        }

        // Get transcript chunks
        const transcriptChunks = await prisma.transcriptChunk.findMany({
            where: {
                meetingId: sampleMeeting.id
            }
        })

        if (transcriptChunks.length === 0) {
            console.log('❌ No transcript chunks found for this meeting')
            return
        }

        console.log(`✅ Found ${transcriptChunks.length} transcript chunks`)

        // Combine all chunks into a single transcript
        const fullTranscript = transcriptChunks
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map(chunk => chunk.content)
            .join(' ')

        console.log(`📝 Processing transcript (${fullTranscript.length} characters)...`)

        // Process the transcript for RAG (this will now work with 768 dimensions)
        await processTranscript(
            sampleMeeting.id,
            sampleMeeting.userId,
            fullTranscript,
            sampleMeeting.title
        )

        // Mark as processed
        await prisma.meeting.update({
            where: {
                id: sampleMeeting.id
            },
            data: {
                ragProcessed: true,
                ragProcessedAt: new Date()
            }
        })

        console.log('🎉 Sample meeting processed successfully for RAG!')
        console.log('✅ Vectors saved to Pinecone with correct 768 dimensions')
        console.log('')
        console.log('🧪 Test your RAG setup:')
        console.log('   1. Go to: http://localhost:3000/chat')
        console.log('   2. Ask: "What was discussed in the Q4 planning meeting?"')
        console.log('   3. Ask: "What are the action items from recent meetings?"')
        console.log('   4. Ask: "Who is responsible for the analytics dashboard?"')
        console.log('')
        console.log('✨ Your meeting bot now has full AI search capabilities!')

    } catch (error) {
        console.error('❌ Error processing meeting:', error)
        console.log('')
        console.log('🔧 Troubleshooting:')
        console.log('   1. Make sure Ollama is running: ollama serve')
        console.log('   2. Check your Pinecone credentials in .env')
        console.log('   3. Verify your database connection')
    }
}

main().catch(console.error)

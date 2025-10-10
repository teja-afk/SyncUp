#!/usr/bin/env tsx

/**
 * Debug Chat Response
 *
 * This script helps debug what the chat API is actually returning.
 * Run with: npx tsx scripts/debug-chat-response.ts
 */

import { config } from 'dotenv'
import { prisma } from '../lib/db'
import { chatWithAllMeetings } from '../lib/rag'

// Load environment variables
config()

async function debugChat() {
    console.log('🔍 Debugging chat responses...')
    console.log('==============================')

    try {
        // First, check if we have any meetings
        console.log('📋 Checking meetings in database...')
        const meetings = await prisma.meeting.findMany()

        console.log(`✅ Found ${meetings.length} meetings`)

        for (const meeting of meetings) {
            // Get transcript chunks count separately
            const chunks = await prisma.transcriptChunk.findMany({
                where: { meetingId: meeting.id }
            })
            console.log(`   📝 ${meeting.title} (${chunks.length} chunks)`)
        }

        // Check if meetings are processed
        const processedMeetings = meetings.filter(m => m.ragProcessed)
        console.log(`✅ ${processedMeetings.length} meetings processed for RAG`)

        if (processedMeetings.length === 0) {
            console.log('❌ No meetings processed for RAG')
            return
        }

        // Test chat responses
        const testQuestions = [
            'What was discussed in the Q4 planning meeting?',
            'What are the action items from recent meetings?',
            'Who is responsible for the analytics dashboard?'
        ]

        console.log('\n🧪 Testing chat responses...')

        for (const question of testQuestions) {
            console.log(`\n❓ Question: "${question}"`)

            const response = await chatWithAllMeetings(processedMeetings[0].userId, question)

            console.log(`🤖 Answer: "${response.answer}"`)

            if (response.sources && response.sources.length > 0) {
                console.log(`📚 Sources found: ${response.sources.length}`)
                response.sources.forEach((source: any, index: number) => {
                    console.log(`   ${index + 1}. ${source.content?.substring(0, 100)}...`)
                })
            } else {
                console.log(`📚 No sources found - this means no vectors in Pinecone`)
            }
        }

    } catch (error) {
        console.error('❌ Debug failed:', error)
    }
}

debugChat().catch(console.error)

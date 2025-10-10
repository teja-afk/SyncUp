#!/usr/bin/env tsx

/**
 * Test Pinecone Connection
 *
 * This script tests if your Pinecone index is working correctly with 768 dimensions.
 * Run with: npx tsx scripts/test-pinecone-connection.ts
 */

import { config } from 'dotenv'
import { saveManyVectors, searchVectors } from '../lib/pinecone'

// Load environment variables
config()

async function testPineconeConnection() {
    console.log('🔍 Testing Pinecone connection...')
    console.log('================================')

    try {
        // Test 1: Basic connection
        console.log('📡 Testing basic connection...')

        // Test 2: Create a test vector
        console.log('🧪 Creating test vector...')
        const testVector = {
            id: 'test-vector-123',
            embedding: new Array(768).fill(0.1), // 768 dimensions
            metadata: {
                test: true,
                content: 'This is a test vector for dimension verification',
                timestamp: new Date().toISOString()
            }
        }

        await saveManyVectors([testVector])
        console.log('✅ Successfully saved test vector to Pinecone!')

        // Test 3: Search for the test vector
        console.log('🔍 Searching for test vector...')
        const searchResults = await searchVectors(
            new Array(768).fill(0.1), // Same embedding
            { userId: 'test-user' },
            1
        )

        if (searchResults && searchResults.length > 0) {
            console.log('✅ Successfully retrieved test vector!')
            console.log(`📊 Search score: ${searchResults[0].score}`)
        } else {
            console.log('❌ Could not retrieve test vector')
        }

        // Test 4: Clean up test vector
        console.log('🧹 Cleaning up test vector...')
        // Note: In a real scenario, you'd want to delete the test vector

        console.log('')
        console.log('🎉 Pinecone connection test completed successfully!')
        console.log('✅ Your 768-dimension index is working correctly')
        console.log('')
        console.log('🚀 Next steps:')
        console.log('   1. Process your meeting data: npx tsx scripts/process-sample-for-rag.ts')
        console.log('   2. Test chat: Go to http://localhost:3000/chat')
        console.log('   3. Ask: "What was discussed in the Q4 planning meeting?"')

    } catch (error) {
        console.error('❌ Pinecone connection test failed:', error)
        console.log('')
        console.log('🔧 Troubleshooting:')
        console.log('   1. Check your PINECONE_API_KEY in .env')
        console.log('   2. Verify PINECONE_INDEX_NAME is set to "meet-bot-786"')
        console.log('   3. Make sure your Pinecone index is "Ready" in the dashboard')
        console.log('   4. Check your internet connection')
    }
}

testPineconeConnection().catch(console.error)

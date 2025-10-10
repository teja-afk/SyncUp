// Simple test script to check chat functionality
// Run with: node test-chat-simple.js

const API_URL = 'http://localhost:3000/api/rag/chat-all';

async function testChat() {
    console.log('🧪 Testing chat functionality...');

    try {
        const testQuestions = [
            'What was discussed in the Q4 planning meeting?',
            'What are the action items from recent meetings?',
            'Who is responsible for the analytics dashboard?'
        ];

        for (const question of testQuestions) {
            console.log(`\n❓ Question: "${question}"`);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question
                })
            });

            const data = await response.json();

            console.log(`📊 Status: ${response.status}`);
            console.log(`🤖 Answer: "${data.answer || 'No answer received'}"`);

            if (data.sources && data.sources.length > 0) {
                console.log(`📚 Sources found: ${data.sources.length}`);
            } else {
                console.log(`📚 No sources found`);
            }

            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testChat();

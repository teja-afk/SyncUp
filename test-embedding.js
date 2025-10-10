import { createEmbedding } from './lib/openai.ts';

async function testEmbedding() {
  try {
    console.log('Testing embedding generation...');
    const embedding = await createEmbedding('Hello world, this is a test');
    console.log('✅ Embedding generated successfully!');
    console.log('Embedding length:', embedding.length);
    console.log('First 5 values:', embedding.slice(0, 5));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmbedding();

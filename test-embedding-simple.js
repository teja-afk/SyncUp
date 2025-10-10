const https = require('http');

async function testEmbedding() {
  try {
    console.log('Testing embedding generation with Ollama...');

    const payload = JSON.stringify({
      model: 'nomic-embed-text',
      prompt: 'Hello world, this is a test'
    });

    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Embedding generated successfully!');
          console.log('Embedding length:', response.embedding.length);
          console.log('First 5 values:', response.embedding.slice(0, 5));
        } catch (error) {
          console.error('❌ Error parsing response:', error.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
    });

    req.write(payload);
    req.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmbedding();

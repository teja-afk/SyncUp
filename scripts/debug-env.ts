async function debugEnvironment() {
  console.log("🔍 Debugging Environment Variables...\n");

  console.log("1. OPENAI_API_KEY:");
  console.log(`   Present: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`   Length: ${process.env.OPENAI_API_KEY?.length || 0}`);
  console.log(`   Prefix: ${process.env.OPENAI_API_KEY?.substring(0, 20)}...`);

  console.log("\n2. PINECONE_API_KEY:");
  console.log(`   Present: ${!!process.env.PINECONE_API_KEY}`);
  console.log(`   Length: ${process.env.PINECONE_API_KEY?.length || 0}`);
  console.log(`   Prefix: ${process.env.PINECONE_API_KEY?.substring(0, 20)}...`);

  console.log("\n3. PINECONE_INDEX_NAME:");
  console.log(`   Present: ${!!process.env.PINECONE_INDEX_NAME}`);
  console.log(`   Value: ${process.env.PINECONE_INDEX_NAME}`);

  console.log("\n4. DATABASE_URL:");
  console.log(`   Present: ${!!process.env.DATABASE_URL}`);
  console.log(`   Length: ${process.env.DATABASE_URL?.length || 0}`);

  console.log("\n5. All env vars with 'API' or 'PINECONE' or 'OPENAI':");
  Object.keys(process.env)
    .filter(key => key.includes('API') || key.includes('PINECONE') || key.includes('OPENAI'))
    .forEach(key => {
      console.log(`   ${key}: ${process.env[key]?.substring(0, 30)}...`);
    });
}

debugEnvironment();

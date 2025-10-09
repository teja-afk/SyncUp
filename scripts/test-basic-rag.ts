import dotenv from 'dotenv';
dotenv.config();

async function testBasicRAG() {
  try {
    console.log("🔧 Testing basic RAG functionality...\n");

    console.log("Environment check:");
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`PINECONE_API_KEY: ${process.env.PINECONE_API_KEY ? '✅ Present' : '❌ Missing'}`);
    console.log(`PINECONE_INDEX_NAME: ${process.env.PINECONE_INDEX_NAME || '❌ Missing'}`);

    // Test if we can at least get to the RAG function without errors
    console.log("\nTesting RAG function accessibility...");

    // Simple test - just try to call the function with minimal data
    const { chatWithAllMeetings } = await import("@/lib/rag");

    console.log("✅ RAG function imported successfully");

    // Test with a user that doesn't exist to see if we get past the vector search
    try {
      const result = await chatWithAllMeetings("nonexistent_user", "test question");
      console.log("✅ RAG function executed successfully");
      console.log("Response:", result.answer.substring(0, 100) + "...");
    } catch (error) {
      console.error("❌ RAG function failed:", error instanceof Error ? error.message : String(error));
    }

  } catch (error) {
    console.error("❌ Basic RAG test failed:", error);
  }
}

testBasicRAG();

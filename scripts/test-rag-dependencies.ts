import dotenv from 'dotenv';
dotenv.config();

import { createEmbedding, chatWithAI } from "@/lib/openai";
import { searchVectors, saveManyVectors } from "@/lib/pinecone";

async function testRAGDependencies() {
  try {
    console.log("🧪 Testing RAG Dependencies...\n");

    // Test 1: OpenAI API Key
    console.log("1. Testing OpenAI API Key...");
    try {
      const testEmbedding = await createEmbedding("test query");
      console.log(`✅ OpenAI embedding created successfully (${testEmbedding.length} dimensions)`);
    } catch (error) {
      console.error(`❌ OpenAI API Key issue:`, error instanceof Error ? error.message : String(error));
      return;
    }

    // Test 2: OpenAI Chat
    console.log("\n2. Testing OpenAI Chat...");
    try {
      const testResponse = await chatWithAI("You are a helpful assistant.", "Say hello");
      console.log(`✅ OpenAI chat working: "${testResponse.substring(0, 50)}..."`);
    } catch (error) {
      console.error(`❌ OpenAI Chat issue:`, error instanceof Error ? error.message : String(error));
      return;
    }

    // Test 3: Pinecone Connection
    console.log("\n3. Testing Pinecone Connection...");
    try {
      // Try to search for vectors (this will likely return empty but should not error)
      const testEmbedding = new Array(1536).fill(0.1); // Small test vector
      const results = await searchVectors(testEmbedding, { userId: "test" }, 1);
      console.log(`✅ Pinecone search working (found ${results.length} results)`);
    } catch (error) {
      console.error(`❌ Pinecone connection issue:`, error instanceof Error ? error.message : String(error));
      return;
    }

    // Test 4: Pinecone Upsert
    console.log("\n4. Testing Pinecone Upsert...");
    try {
      const testVectors = [{
        id: "test_vector_123",
        embedding: new Array(1536).fill(0.1),
        metadata: {
          meetingId: "test",
          userId: "test",
          content: "test content",
          speakerName: "test speaker"
        }
      }];

      await saveManyVectors(testVectors);
      console.log(`✅ Pinecone upsert working`);
    } catch (error) {
      console.error(`❌ Pinecone upsert issue:`, error instanceof Error ? error.message : String(error));
      return;
    }

    console.log("\n🎉 All RAG dependencies are working correctly!");
    console.log("The chat-all endpoint should now work properly.");

  } catch (error) {
    console.error("❌ Error testing RAG dependencies:", error);
    throw error;
  }
}

// Run the test
testRAGDependencies()
  .catch((error) => {
    console.error("Test script failed:", error);
    process.exit(1);
  });

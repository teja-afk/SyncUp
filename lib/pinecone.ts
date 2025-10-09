import { Pinecone } from '@pinecone-database/pinecone'

// Ensure environment variables are loaded
if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
    console.warn('Pinecone environment variables not found. Vector search will not work.');
}

// Initialize Pinecone client with proper error handling
let pinecone: Pinecone | null = null;
let index: any = null;

try {
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        index = pinecone.index(process.env.PINECONE_INDEX_NAME);
        console.log('Pinecone initialized successfully');
    } else {
        console.warn('Pinecone not initialized due to missing configuration');
    }
} catch (error) {
    console.error('Failed to initialize Pinecone:', error);
}

export async function saveManyVectors(vectors: Array<{
    id: string
    embedding: number[]
    metadata: Record<string, unknown>
}>) {
    // Check if Pinecone is properly initialized
    if (!pinecone || !index) {
        console.warn('Pinecone not initialized, skipping vector save');
        return;
    }

    const upsertData = vectors.map(v => ({
        id: v.id,
        values: v.embedding,
        metadata: v.metadata
    }))

    await index.upsert(upsertData)
}

export async function searchVectors(
    embedding: number[],
    filter: Record<string, unknown> = {},
    topK: number = 5
) {
    // Check if Pinecone is properly initialized
    if (!pinecone || !index) {
        console.warn('Pinecone not initialized, returning empty results');
        return [];
    }

    const result = await index.query({
        vector: embedding,
        filter,
        topK,
        includeMetadata: true
    })

    return result.matches || []
}


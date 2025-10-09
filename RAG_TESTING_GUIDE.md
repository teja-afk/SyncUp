# RAG (Retrieval Augmented Generation) Testing Guide

## What is RAG?

RAG allows you to chat with your meeting data. It:
1. Breaks meeting transcripts into chunks
2. Creates embeddings (vector representations) using OpenAI
3. Stores embeddings in Pinecone vector database
4. Retrieves relevant context when you ask questions
5. Uses GPT-4 to generate answers based on that context

---

## Prerequisites

Before testing RAG, ensure you have:

### 1. Required Environment Variables
```env
OPENAI_API_KEY=sk-...           # For embeddings and chat
PINECONE_API_KEY=...            # For vector storage
PINECONE_INDEX_NAME=...         # Your Pinecone index name
```

### 2. Pinecone Setup
1. Go to https://www.pinecone.io/
2. Create a free account
3. Create an index with:
   - **Dimensions**: 1536 (for OpenAI text-embedding-3-small)
   - **Metric**: cosine
   - **Name**: meetbot-embeddings (or your choice)

### 3. User Account
- Sign up at http://localhost:3000/sign-up
- You need a user account to seed meetings

---

## Step-by-Step RAG Testing

### Step 1: Seed Sample Meeting Data

Run the seed script to create a sample meeting:

```bash
npx tsx scripts/seed-sample-meeting.ts
```

**Expected Output:**
```
🌱 Starting to seed sample meeting data...
✅ Found user: your-email@example.com
✅ Created sample meeting: Q4 Product Planning Meeting
📝 Meeting ID: clxxx...
✅ Created 3 transcript chunks

🎉 Sample meeting data seeded successfully!

📋 Next steps:
1. Run the RAG processor to create embeddings
2. Test the chat feature
3. View the meeting
```

**What this creates:**
- 1 complete meeting with transcript
- 3 transcript chunks in the database
- Action items and summary
- Ready for RAG processing

---

### Step 2: Process Meeting for RAG

Process the meeting to create embeddings:

**Option A: Using API (Recommended)**
```bash
# Replace MEETING_ID with the ID from Step 1
curl -X POST http://localhost:3000/api/rag/process \
  -H "Content-Type: application/json" \
  -d '{"meetingId":"MEETING_ID"}'
```

**Option B: Using Browser**
1. Open http://localhost:3000/meeting/MEETING_ID
2. The RAG processing should happen automatically
3. Check the console for processing logs

**Expected Response:**
```json
{
  "success": true,
  "message": "Meeting processed for RAG",
  "chunksProcessed": 3,
  "vectorsCreated": 3
}
```

**What happens:**
1. Transcript chunks are retrieved from database
2. Each chunk is converted to embeddings via OpenAI
3. Embeddings are stored in Pinecone with metadata
4. Meeting is marked as `ragProcessed: true`

---

### Step 3: Test Chat with Single Meeting

**URL:** http://localhost:3000/meeting/MEETING_ID (scroll to chat section)

**Test Questions:**
```
1. "What was this meeting about?"
2. "What are the main action items?"
3. "Who is responsible for the analytics dashboard?"
4. "What is the deadline for mobile optimization?"
5. "What features were discussed?"
6. "Summarize the key decisions made"
```

**Expected Behavior:**
- AI retrieves relevant chunks from Pinecone
- Generates contextual answers based on meeting content
- Cites specific information from the transcript
- Provides accurate details about action items and deadlines

---

### Step 4: Test Chat Across All Meetings

**URL:** http://localhost:3000/chat

**Test Questions:**
```
1. "What meetings have I had recently?"
2. "Show me all action items across my meetings"
3. "What topics were discussed in my meetings?"
4. "Who attended the Q4 planning meeting?"
5. "What are the upcoming deadlines?"
6. "Summarize all my meetings this month"
```

**Expected Behavior:**
- AI searches across ALL meeting embeddings
- Aggregates information from multiple meetings
- Provides comprehensive answers
- Can compare and contrast different meetings

---

### Step 5: Verify in Pinecone Dashboard

1. Go to https://app.pinecone.io/
2. Select your index
3. Check "Vectors" tab
4. You should see vectors with metadata like:
   ```json
   {
     "meetingId": "clxxx...",
     "chunkIndex": 0,
     "meetingTitle": "Q4 Product Planning Meeting",
     "content": "Meeting transcript chunk..."
   }
   ```

---

## Advanced Testing

### Test Multiple Meetings

Create more sample meetings:

```bash
# Run the seed script multiple times with different data
npx tsx scripts/seed-sample-meeting.ts
```

Or manually create meetings through:
1. Google Calendar integration
2. Actual meeting recordings
3. Manual database entries

### Test RAG Performance

**Query Similarity:**
```
Ask: "What was discussed about analytics?"
Then: "Tell me about the dashboard feature"
```
Both should return similar, relevant information.

**Context Window:**
```
Ask: "What did Sarah say about the analytics dashboard?"
```
Should retrieve chunks where Sarah spoke about analytics.

**Multi-Meeting Context:**
```
Ask: "Compare the action items from all my meetings"
```
Should aggregate data from multiple meetings.

---

## Debugging RAG Issues

### Issue 1: No Results from Chat

**Check:**
```bash
# Verify meeting is processed
npx prisma studio
# Check Meeting table → ragProcessed should be true
```

**Solution:**
```bash
# Reprocess the meeting
curl -X POST http://localhost:3000/api/rag/process \
  -H "Content-Type: application/json" \
  -d '{"meetingId":"MEETING_ID"}'
```

### Issue 2: Embeddings Not Created

**Check Environment Variables:**
```bash
# In your .env file
OPENAI_API_KEY=sk-...  # Must be valid
PINECONE_API_KEY=...   # Must be valid
PINECONE_INDEX_NAME=... # Must match your index
```

**Check Pinecone Index:**
- Dimensions must be 1536
- Index must exist and be active
- API key must have write permissions

### Issue 3: Irrelevant Answers

**Possible Causes:**
- Not enough context in chunks
- Embeddings not properly created
- Query doesn't match content

**Solution:**
- Increase chunk size in text-chunker.ts
- Reprocess meetings
- Try more specific questions

### Issue 4: API Errors

**Check Browser Console (F12):**
```javascript
// Look for errors like:
"Failed to fetch embeddings"
"Pinecone connection error"
"OpenAI API error"
```

**Check Server Logs:**
```bash
# In your terminal running npm run dev
# Look for error messages
```

---

## Testing Checklist

### Basic RAG Functionality
- [ ] Sample meeting seeded successfully
- [ ] RAG processing completes without errors
- [ ] Embeddings visible in Pinecone dashboard
- [ ] Chat returns relevant answers
- [ ] Action items are correctly identified
- [ ] Speakers are correctly attributed

### Advanced RAG Features
- [ ] Multi-meeting search works
- [ ] Context aggregation across meetings
- [ ] Semantic search (similar questions get similar answers)
- [ ] Real-time chat responses
- [ ] Chat history maintained
- [ ] Suggestions provided

### Performance
- [ ] Embedding creation < 5 seconds per meeting
- [ ] Chat response time < 3 seconds
- [ ] Accurate retrieval of relevant chunks
- [ ] No duplicate or irrelevant results

---

## Sample Test Conversation

Here's what a successful RAG test looks like:

**You:** "What was discussed in the Q4 planning meeting?"

**AI:** "In the Q4 Product Planning Meeting, the team discussed three major features for the next quarter:

1. **AI-powered Analytics Dashboard** - Sarah Johnson suggested this as a priority, with real-time data visualization and custom report generation
2. **Mobile App Performance Optimization** - Mike Chen highlighted the need to improve load times to under 2 seconds
3. **Integrations** - John Smith proposed adding Slack and Microsoft Teams integrations for better user adoption

The team set deadlines: Analytics dashboard by end of October, mobile optimization by mid-November, and integrations by December."

**You:** "Who is responsible for the analytics dashboard?"

**AI:** "Sarah Johnson is responsible for leading the analytics dashboard development. She will focus on implementing real-time data visualization and custom report generation features, with a deadline of October 31st."

---

## Expected Results

After successful RAG testing:

✅ **Embeddings Created:**
- Transcript chunks converted to vectors
- Stored in Pinecone with metadata
- Searchable via semantic similarity

✅ **Chat Works:**
- Answers questions about meetings
- Retrieves relevant context
- Provides accurate information
- Cites specific details

✅ **Multi-Meeting Search:**
- Searches across all meetings
- Aggregates information
- Compares different meetings
- Provides comprehensive answers

---

## Useful Commands

```bash
# Seed sample meeting
npx tsx scripts/seed-sample-meeting.ts

# Process meeting for RAG
curl -X POST http://localhost:3000/api/rag/process \
  -H "Content-Type: application/json" \
  -d '{"meetingId":"MEETING_ID"}'

# View database
npx prisma studio

# Check server logs
npm run dev

# Test chat API directly
curl -X POST http://localhost:3000/api/rag/chat-meeting \
  -H "Content-Type: application/json" \
  -d '{"meetingId":"MEETING_ID","message":"What was discussed?"}'
```

---

## Next Steps

After successful RAG testing:

1. **Create More Meetings:**
   - Connect Google Calendar
   - Schedule real meetings
   - Let the bot join and record

2. **Test Real Scenarios:**
   - Ask about actual meeting content
   - Search for specific topics
   - Track action items

3. **Optimize Performance:**
   - Adjust chunk sizes
   - Fine-tune embedding parameters
   - Improve retrieval accuracy

4. **Monitor Usage:**
   - Check OpenAI API usage
   - Monitor Pinecone vector count
   - Track chat message volume

**Your RAG system is now ready to make your meetings searchable and actionable! 🚀**

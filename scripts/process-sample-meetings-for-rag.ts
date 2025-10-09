import { prisma } from "@/lib/db";
import { processTranscript } from "@/lib/rag";

async function processSampleMeetingsForRAG() {
  try {
    console.log("Processing sample meetings for RAG functionality...");

    // Find the sample meetings we created
    const sampleMeetings = await prisma.meeting.findMany({
      where: {
        title: {
          in: [
            "Weekly Team Standup - Sprint Review",
            "Q4 Product Roadmap Planning",
            "Monthly Team Retrospective"
          ]
        }
      }
    });

    console.log(`Found ${sampleMeetings.length} sample meetings to process`);

    for (const meeting of sampleMeetings) {
      console.log(`\nProcessing meeting: ${meeting.title}`);

      // Check if transcript chunks exist
      const chunkCount = await prisma.transcriptChunk.count({
        where: { meetingId: meeting.id }
      });

      console.log(`Found ${chunkCount} transcript chunks for meeting: ${meeting.title}`);

      if (chunkCount === 0) {
        console.log(`❌ No transcript chunks found for meeting: ${meeting.title}`);
        continue;
      }

      // Check if already processed
      if (meeting.ragProcessed) {
        console.log(`✅ Meeting already processed for RAG: ${meeting.title}`);
        continue;
      }

      try {
        // Get the transcript text from chunks
        const chunks = await prisma.transcriptChunk.findMany({
          where: { meetingId: meeting.id },
          orderBy: { chunkIndex: 'asc' }
        });

        const transcriptText = chunks.map(chunk => chunk.content).join('\n');

        console.log(`Processing ${transcriptText.length} characters of transcript text...`);

        // Process the transcript for RAG
        await processTranscript(
          meeting.id,
          meeting.userId,
          transcriptText,
          meeting.title
        );

        // Mark meeting as RAG processed
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: {
            ragProcessed: true,
            ragProcessedAt: new Date()
          }
        });

        console.log(`✅ Successfully processed meeting for RAG: ${meeting.title}`);

      } catch (error) {
        console.error(`❌ Error processing meeting ${meeting.id}:`, error);
      }
    }

    console.log("\n✅ Finished processing sample meetings for RAG!");

    // Verify the results
    const processedMeetings = await prisma.meeting.count({
      where: {
        ragProcessed: true,
        title: {
          in: [
            "Weekly Team Standup - Sprint Review",
            "Q4 Product Roadmap Planning",
            "Monthly Team Retrospective"
          ]
        }
      }
    });

    console.log(`\n📊 Summary: ${processedMeetings}/3 sample meetings are now RAG-ready`);

  } catch (error) {
    console.error("❌ Error in RAG processing script:", error);
    throw error;
  }
}

// Run the script
processSampleMeetingsForRAG()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

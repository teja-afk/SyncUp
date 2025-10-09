import { prisma } from "@/lib/db";

async function fixSampleMeetingsAudio() {
  try {
    console.log("Updating existing sample meetings to use correct audio file...");

    // Find all meetings with the old S3 audio URL
    const meetingsToUpdate = await prisma.meeting.findMany({
      where: {
        recordingUrl: "https://meetingbot1.s3.eu-north-1.amazonaws.com/test-audio.mp3"
      }
    });

    console.log(`Found ${meetingsToUpdate.length} meetings to update`);

    // Update each meeting to use the local audio file
    for (const meeting of meetingsToUpdate) {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          recordingUrl: "/test-audio.mp3"
        }
      });

      console.log(`Updated meeting: ${meeting.title} (ID: ${meeting.id})`);
    }

    console.log(`✅ Successfully updated ${meetingsToUpdate.length} meetings to use local audio file!`);
    console.log("The audio and transcripts should now be properly matched.");

  } catch (error) {
    console.error("❌ Error updating sample meetings:", error);
    throw error;
  }
}

// Run the script
fixSampleMeetingsAudio()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

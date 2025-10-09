import { prisma } from "@/lib/db";

async function fixSampleMeetingsActionItems() {
  try {
    console.log("Fixing action items structure in existing sample meetings...");

    // Find all meetings that might have string arrays instead of object arrays for action items
    const meetingsToCheck = await prisma.meeting.findMany({
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

    console.log(`Found ${meetingsToCheck.length} sample meetings to check`);

    for (const meeting of meetingsToCheck) {
      if (meeting.actionItems) {
        try {
          const actionItems = meeting.actionItems;

          // Check if actionItems is an array of strings (wrong format)
          if (Array.isArray(actionItems) && actionItems.length > 0 && typeof actionItems[0] === 'string') {
            console.log(`Fixing action items for meeting: ${meeting.title}`);

            // Convert string array to object array with proper IDs
            const fixedActionItems = actionItems.map((text, index) => ({
              id: meeting.id + "_action_" + (index + 1),
              text: text
            }));

            await prisma.meeting.update({
              where: { id: meeting.id },
              data: {
                actionItems: fixedActionItems
              }
            });

            console.log(`✅ Fixed ${fixedActionItems.length} action items for: ${meeting.title}`);
          } else {
            console.log(`✅ Action items already in correct format for: ${meeting.title}`);
          }
        } catch (error) {
          console.error(`❌ Error fixing action items for meeting ${meeting.id}:`, error);
        }
      }
    }

    console.log("✅ Finished fixing sample meetings action items structure!");

  } catch (error) {
    console.error("❌ Error in fix script:", error);
    throw error;
  }
}

// Run the script
fixSampleMeetingsActionItems()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

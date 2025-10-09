import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

const sampleTranscripts = [
  {
    segments: [
      {
        speaker: "John Doe",
        text: "Welcome everyone to our weekly team standup. Let's go around and share what we've accomplished this week and what we're planning for next week.",
        timestamp: "00:00:15"
      },
      {
        speaker: "Jane Smith",
        text: "I completed the user authentication module and it's ready for testing. I also started working on the dashboard redesign that we discussed last week.",
        timestamp: "00:00:45"
      },
      {
        speaker: "Mike Johnson",
        text: "I finished the API integration for the payment system. We should be able to process transactions smoothly now. I'm planning to work on optimizing the database queries next.",
        timestamp: "00:01:20"
      },
      {
        speaker: "Sarah Wilson",
        text: "I deployed the new features to production and monitored the rollout. Everything went smoothly with minimal downtime. Next week I'll focus on the mobile responsiveness improvements.",
        timestamp: "00:02:10"
      }
    ]
  },
  {
    segments: [
      {
        speaker: "Alex Chen",
        text: "Today we're discussing the Q4 product roadmap and priorities. Based on customer feedback and market analysis, we need to prioritize these key areas.",
        timestamp: "00:00:20"
      },
      {
        speaker: "Emma Davis",
        text: "The analytics show that user engagement is highest with our collaboration features. I recommend we enhance the real-time editing capabilities and add more integration options.",
        timestamp: "00:01:05"
      },
      {
        speaker: "David Brown",
        text: "Security is also a top concern. We should implement end-to-end encryption and improve our audit logging system before the enterprise launch.",
        timestamp: "00:02:30"
      },
      {
        speaker: "Lisa Garcia",
        text: "I agree with the security priorities. We also need to ensure our mobile app performance meets the industry standards. Let me share the performance benchmarks I compiled.",
        timestamp: "00:03:45"
      }
    ]
  },
  {
    segments: [
      {
        speaker: "Tom Anderson",
        text: "This is our monthly retrospective meeting. Let's review what went well this month and identify areas for improvement.",
        timestamp: "00:00:10"
      },
      {
        speaker: "Rachel Martinez",
        text: "The team collaboration has been excellent. Our use of the new project management tool has really streamlined our workflow and improved visibility across departments.",
        timestamp: "00:00:55"
      },
      {
        speaker: "Chris Taylor",
        text: "One area we can improve is our testing coverage. We had a few bugs slip through to production this month. I suggest we implement automated testing for critical user journeys.",
        timestamp: "00:02:15"
      },
      {
        speaker: "Amanda White",
        text: "Communication between design and development teams has been much better. The new design system we implemented has reduced back-and-forth iterations significantly.",
        timestamp: "00:03:40"
      }
    ]
  }
];

const sampleSummaries = [
  "Weekly team standup where team members discussed completed tasks including user authentication, API integrations, and production deployments. Plans for next week include dashboard improvements and database optimization.",
  "Q4 product roadmap discussion focusing on user engagement features, security enhancements, and mobile performance improvements. Team aligned on priorities for the upcoming quarter.",
  "Monthly retrospective highlighting successful team collaboration and communication improvements. Identified need for better testing coverage and automated quality assurance processes."
];

const sampleActionItems = [
  [
    { id: 1, text: "Jane to schedule testing session for authentication module" },
    { id: 2, text: "Mike to create database query optimization plan" },
    { id: 3, text: "Sarah to prepare mobile responsiveness improvement proposal" }
  ],
  [
    { id: 4, text: "Emma to draft detailed requirements for real-time editing features" },
    { id: 5, text: "David to prepare security implementation timeline" },
    { id: 6, text: "Lisa to share mobile performance benchmarks with the team" }
  ],
  [
    { id: 7, text: "Chris to research automated testing tools and present options" },
    { id: 8, text: "Amanda to document the new design system components" },
    { id: 9, text: "Rachel to organize cross-team workshop on project management tools" }
  ]
];

async function createSamplePastMeetings() {
  try {
    // Get the first user from the database, or create a test user if none exists
    let user = await prisma.user.findFirst();

    if (!user) {
      console.log("No users found, creating a test user...");
      user = await prisma.user.create({
        data: {
          id: "test_user_for_sample_meetings",
          clerkId: "test_user_for_sample_meetings",
          email: "test@example.com",
          name: "Test User",
          calenderConnected: true,
          googleAccessToken: "sample_token",
          currentPlan: "premium"
        }
      });
    }

    console.log(`Creating sample meetings for user: ${user.id}`);

    const now = new Date();

    // Create 3 sample past meetings from different time periods
    const meetingsData = [
      {
        title: "Weekly Team Standup - Sprint Review",
        description: "Regular team standup to review completed work and plan upcoming tasks",
        daysAgo: 2,
        transcript: sampleTranscripts[0],
        summary: sampleSummaries[0],
        actionItems: sampleActionItems[0]
      },
      {
        title: "Q4 Product Roadmap Planning",
        description: "Strategic planning session for Q4 product development priorities",
        daysAgo: 7,
        transcript: sampleTranscripts[1],
        summary: sampleSummaries[1],
        actionItems: sampleActionItems[1]
      },
      {
        title: "Monthly Team Retrospective",
        description: "Monthly review of team performance, achievements, and improvement areas",
        daysAgo: 14,
        transcript: sampleTranscripts[2],
        summary: sampleSummaries[2],
        actionItems: sampleActionItems[2]
      }
    ];

    for (let i = 0; i < meetingsData.length; i++) {
      const meetingData = meetingsData[i];

      // Calculate past meeting times (1-2 hours duration, various days ago)
      const meetingStart = new Date(now.getTime() - (meetingData.daysAgo * 24 * 60 * 60 * 1000));
      const meetingEnd = new Date(meetingStart.getTime() + (90 * 60 * 1000)); // 90 minutes

      const meeting = await prisma.meeting.create({
        data: {
          userId: user.id,
          title: meetingData.title,
          description: meetingData.description,
          meetingUrl: "https://meet.google.com/sample-meeting-link",
          startTime: meetingStart,
          endTime: meetingEnd,

          // Calendar integration fields
          calendarEventId: `sample_calendar_event_${i + 1}`,
          isFromCalendar: true,

          // Bot fields
          botScheduled: true,
          botSent: true,
          botId: `bot_${i + 1}`,
          botJoinedAt: meetingStart,

          // Meeting completion fields
          meetingEnded: true,
          transcriptReady: true,
          transcript: meetingData.transcript,
          recordingUrl: "/test-audio.mp3",

          // Post-processing fields
          summary: meetingData.summary,
          actionItems: meetingData.actionItems,
          processed: true,
          processedAt: meetingEnd,
          emailSent: true,
          emailSentAt: meetingEnd,
          ragProcessed: true,
          ragProcessedAt: meetingEnd,

          // Sample attendees
          attendees: JSON.stringify([
            { email: "john.doe@company.com", name: "John Doe" },
            { email: "jane.smith@company.com", name: "Jane Smith" },
            { email: "mike.johnson@company.com", name: "Mike Johnson" }
          ])
        }
      });

      console.log(`Created sample meeting: ${meeting.title} (ID: ${meeting.id})`);

      // Create transcript chunks for RAG functionality
      if (meetingData.transcript.segments) {
        for (let j = 0; j < meetingData.transcript.segments.length; j++) {
          const segment = meetingData.transcript.segments[j];

          await prisma.transcriptChunk.create({
            data: {
              meetingId: meeting.id,
              chunkIndex: j,
              content: segment.text,
              speakerName: segment.speaker
            }
          });
        }
      }

      console.log(`Created ${meetingData.transcript.segments.length} transcript chunks for meeting: ${meeting.title}`);
    }

    console.log(`\n✅ Successfully created ${meetingsData.length} sample past meetings with transcripts!`);
    console.log("You can now test the AI chat features with these sample meetings.");

  } catch (error) {
    console.error("❌ Error creating sample meetings:", error);
    throw error;
  }
}

// Run the script
createSamplePastMeetings()
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

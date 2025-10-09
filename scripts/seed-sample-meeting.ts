import { prisma } from '../lib/db';

async function seedSampleMeeting() {
  try {
    console.log('🌱 Starting to seed sample meeting data...');

    // Get the first user from the database
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('❌ No user found in database. Please sign up first!');
      console.log('👉 Go to http://localhost:3000/sign-up to create an account');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email || user.clerkId}`);

    // Sample meeting data
    const sampleMeeting = {
      userId: user.id,
      title: 'Q4 Product Planning Meeting',
      description: 'Quarterly planning session for product roadmap and feature prioritization',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:30:00Z'),
      attendees: [
        { name: 'John Smith', email: 'john@example.com' },
        { name: 'Sarah Johnson', email: 'sarah@example.com' },
        { name: 'Mike Chen', email: 'mike@example.com' },
      ],
      isFromCalendar: false,
      botScheduled: true,
      botSent: true,
      meetingEnded: true,
      transcriptReady: true,
      transcript: [
        {
          speaker: 'John Smith',
          offset: 15,
          words: [
            { word: 'Good', start: 15, end: 15.2 },
            { word: 'morning', start: 15.2, end: 15.5 },
            { word: 'everyone.', start: 15.5, end: 16 },
            { word: "Let's", start: 16, end: 16.3 },
            { word: 'start', start: 16.3, end: 16.6 },
            { word: 'with', start: 16.6, end: 16.8 },
            { word: 'our', start: 16.8, end: 17 },
            { word: 'Q4', start: 17, end: 17.3 },
            { word: 'planning.', start: 17.3, end: 17.8 },
            { word: 'We', start: 17.8, end: 18 },
            { word: 'need', start: 18, end: 18.2 },
            { word: 'to', start: 18.2, end: 18.3 },
            { word: 'prioritize', start: 18.3, end: 18.8 },
            { word: 'three', start: 18.8, end: 19 },
            { word: 'major', start: 19, end: 19.3 },
            { word: 'features', start: 19.3, end: 19.7 },
            { word: 'for', start: 19.7, end: 19.9 },
            { word: 'the', start: 19.9, end: 20 },
            { word: 'next', start: 20, end: 20.2 },
            { word: 'quarter.', start: 20.2, end: 20.6 },
          ],
        },
        {
          speaker: 'Sarah Johnson',
          offset: 90,
          words: [
            { word: 'I', start: 90, end: 90.1 },
            { word: 'think', start: 90.1, end: 90.3 },
            { word: 'we', start: 90.3, end: 90.4 },
            { word: 'should', start: 90.4, end: 90.6 },
            { word: 'focus', start: 90.6, end: 90.9 },
            { word: 'on', start: 90.9, end: 91 },
            { word: 'the', start: 91, end: 91.1 },
            { word: 'AI-powered', start: 91.1, end: 91.6 },
            { word: 'analytics', start: 91.6, end: 92 },
            { word: 'dashboard', start: 92, end: 92.4 },
            { word: 'first.', start: 92.4, end: 92.8 },
            { word: 'Our', start: 92.8, end: 93 },
            { word: 'customers', start: 93, end: 93.4 },
            { word: 'have', start: 93.4, end: 93.6 },
            { word: 'been', start: 93.6, end: 93.8 },
            { word: 'requesting', start: 93.8, end: 94.3 },
            { word: 'this', start: 94.3, end: 94.5 },
            { word: 'for', start: 94.5, end: 94.7 },
            { word: 'months.', start: 94.7, end: 95.1 },
          ],
        },
        {
          speaker: 'Mike Chen',
          offset: 165,
          words: [
            { word: 'Agreed.', start: 165, end: 165.4 },
            { word: 'We', start: 165.4, end: 165.5 },
            { word: 'also', start: 165.5, end: 165.8 },
            { word: 'need', start: 165.8, end: 166 },
            { word: 'to', start: 166, end: 166.1 },
            { word: 'improve', start: 166.1, end: 166.5 },
            { word: 'the', start: 166.5, end: 166.6 },
            { word: 'mobile', start: 166.6, end: 166.9 },
            { word: 'app', start: 166.9, end: 167.1 },
            { word: 'performance.', start: 167.1, end: 167.7 },
            { word: 'The', start: 167.7, end: 167.9 },
            { word: 'current', start: 167.9, end: 168.2 },
            { word: 'load', start: 168.2, end: 168.4 },
            { word: 'time', start: 168.4, end: 168.6 },
            { word: 'is', start: 168.6, end: 168.7 },
            { word: 'too', start: 168.7, end: 168.9 },
            { word: 'slow.', start: 168.9, end: 169.2 },
          ],
        },
        {
          speaker: 'John Smith',
          offset: 240,
          words: [
            { word: 'Good', start: 240, end: 240.2 },
            { word: 'points.', start: 240.2, end: 240.6 },
            { word: "Let's", start: 240.6, end: 240.9 },
            { word: 'also', start: 240.9, end: 241.1 },
            { word: 'consider', start: 241.1, end: 241.5 },
            { word: 'the', start: 241.5, end: 241.6 },
            { word: 'integration', start: 241.6, end: 242.1 },
            { word: 'with', start: 242.1, end: 242.3 },
            { word: 'Slack', start: 242.3, end: 242.6 },
            { word: 'and', start: 242.6, end: 242.7 },
            { word: 'Microsoft', start: 242.7, end: 243.1 },
            { word: 'Teams.', start: 243.1, end: 243.5 },
            { word: 'That', start: 243.5, end: 243.7 },
            { word: 'would', start: 243.7, end: 243.9 },
            { word: 'help', start: 243.9, end: 244.1 },
            { word: 'with', start: 244.1, end: 244.3 },
            { word: 'user', start: 244.3, end: 244.5 },
            { word: 'adoption.', start: 244.5, end: 245 },
          ],
        },
      ],
      speakers: [
        { name: 'John Smith', speakTime: 420 },
        { name: 'Sarah Johnson', speakTime: 380 },
        { name: 'Mike Chen', speakTime: 340 },
      ],
      summary: `# Q4 Product Planning Meeting Summary

## Key Discussion Points
- Prioritization of three major features for Q4
- AI-powered analytics dashboard development
- Mobile app performance optimization
- Integration with Slack and Microsoft Teams

## Decisions Made
1. **Analytics Dashboard**: Priority #1 - Include real-time data visualization and custom report generation
2. **Mobile Optimization**: Target load time under 2 seconds
3. **Integrations**: Focus on Slack and Microsoft Teams for better user adoption

## Timeline
- Analytics Dashboard: End of October
- Mobile Optimization: Mid-November
- Integrations: December

## Team Assignments
- Sarah Johnson: Lead analytics dashboard development
- Mike Chen: Lead mobile optimization efforts
- John Smith: Oversee integration development`,
      actionItems: [
        {
          id: '1',
          task: 'Design and implement AI-powered analytics dashboard with real-time data visualization',
          assignee: 'Sarah Johnson',
          dueDate: '2024-10-31',
          status: 'pending',
          priority: 'high',
        },
        {
          id: '2',
          task: 'Optimize mobile app performance to achieve under 2 seconds load time',
          assignee: 'Mike Chen',
          dueDate: '2024-11-15',
          status: 'pending',
          priority: 'high',
        },
        {
          id: '3',
          task: 'Develop Slack and Microsoft Teams integrations',
          assignee: 'John Smith',
          dueDate: '2024-12-15',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: '4',
          task: 'Create custom report generation feature for analytics dashboard',
          assignee: 'Sarah Johnson',
          dueDate: '2024-10-31',
          status: 'pending',
          priority: 'medium',
        },
      ],
      processed: true,
      processedAt: new Date('2024-01-15T12:00:00Z'),
      emailSent: true,
      emailSentAt: new Date('2024-01-15T12:15:00Z'),
      ragProcessed: false, // Will be processed by the RAG script
    };

    // Create the meeting
    const meeting = await prisma.meeting.create({
      data: sampleMeeting,
    });

    console.log(`✅ Created sample meeting: ${meeting.title}`);
    console.log(`📝 Meeting ID: ${meeting.id}`);

    // Create transcript chunks for RAG
    const transcriptText = sampleMeeting.transcript
      .map((seg) => {
        const text = seg.words.map(w => w.word).join(' ');
        return `${seg.speaker}: ${text}`;
      })
      .join('\n\n');

    // Split into chunks (simulate what the RAG processor does)
    const chunks = [
      {
        meetingId: meeting.id,
        chunkIndex: 0,
        content: `Meeting: ${meeting.title}\n\n${transcriptText.substring(0, 500)}`,
        speakerName: 'Multiple Speakers',
      },
      {
        meetingId: meeting.id,
        chunkIndex: 1,
        content: transcriptText.substring(500, 1000),
        speakerName: 'Multiple Speakers',
      },
      {
        meetingId: meeting.id,
        chunkIndex: 2,
        content: transcriptText.substring(1000),
        speakerName: 'Multiple Speakers',
      },
    ];

    // Create transcript chunks
    for (const chunk of chunks) {
      await prisma.transcriptChunk.create({
        data: chunk,
      });
    }

    console.log(`✅ Created ${chunks.length} transcript chunks`);

    console.log('\n🎉 Sample meeting data seeded successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the RAG processor to create embeddings:');
    console.log(`   curl -X POST http://localhost:3000/api/rag/process -H "Content-Type: application/json" -d '{"meetingId":"${meeting.id}"}'`);
    console.log('\n2. Test the chat feature:');
    console.log('   - Go to http://localhost:3000/chat');
    console.log('   - Ask: "What was discussed in the Q4 planning meeting?"');
    console.log('   - Ask: "What are the action items from recent meetings?"');
    console.log('   - Ask: "Who is responsible for the analytics dashboard?"');
    console.log('\n3. View the meeting:');
    console.log(`   http://localhost:3000/meeting/${meeting.id}`);

  } catch (error) {
    console.error('❌ Error seeding sample meeting:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleMeeting();

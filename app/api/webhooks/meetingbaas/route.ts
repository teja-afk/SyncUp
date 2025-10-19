import { processMeetingTranscript } from "@/lib/ai-processor";
import { prisma } from "@/lib/db";
import { sendMeetingSummaryEmail } from "@/lib/email-service-free";
import { processTranscript } from "@/lib/rag";
import { incrementMeetingUsage } from "@/lib/usage";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from "next/server";

// Initialize S3 client for audio uploads
const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export async function POST(request: NextRequest) {
    try {
        const webhook = await request.json()

        if (webhook.event === 'complete') {
            const webhookData = webhook.data

            const meeting = await prisma.meeting.findFirst({
                where: {
                    botId: webhookData.bot_id
                },
                include: {
                    user: true
                }
            })

            if (!meeting) {
                console.error('❌ Meeting not found for bot_id:', webhookData.bot_id)
                console.error('Available botIds in database:', await prisma.meeting.findMany({
                    where: { botId: { not: null } },
                    select: { id: true, botId: true, title: true }
                }))
                return NextResponse.json({ error: 'meeting not found' }, { status: 404 })
            }

            console.log('✅ Found meeting:', meeting.title, 'for bot_id:', webhookData.bot_id)

            await incrementMeetingUsage(meeting.userId)

            if (!meeting.user.email) {
                console.error('user email not found for this meeting', meeting.id)
                return NextResponse.json({ error: 'user email not found' }, { status: 400 })
            }

            // Upload recording to S3 if available
            let recordingUrl = webhookData.mp4 || null;

            if (webhookData.mp4 && process.env.S3_BUCKET_NAME) {
                try {
                    console.log('Uploading recording to S3:', webhookData.mp4);

                    // Download audio from MeetingBaaS
                    const audioResponse = await fetch(webhookData.mp4);
                    if (audioResponse.ok) {
                        const audioBuffer = await audioResponse.arrayBuffer();

                        // Generate S3 key for the recording
                        const s3Key = `recordings/${meeting.id}-${Date.now()}.mp4`;

                        // Upload to S3
                        const uploadCommand = new PutObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME!,
                            Key: s3Key,
                            Body: Buffer.from(audioBuffer),
                            ContentType: 'audio/mp4'
                        });

                        await s3Client.send(uploadCommand);

                        // Generate public S3 URL
                        recordingUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

                        console.log('Recording uploaded to S3:', recordingUrl);
                    }
                } catch (s3Error) {
                    console.error('Failed to upload recording to S3:', s3Error);
                    // Continue with original URL if S3 upload fails
                    recordingUrl = webhookData.mp4;
                }
            }

            console.log('📝 Updating meeting with completion data...')
            await prisma.meeting.update({
                where: {
                    id: meeting.id
                },
                data: {
                    meetingEnded: true,
                    transcriptReady: true,
                    transcript: webhookData.transcript || null,
                    recordingUrl: recordingUrl,
                    speakers: webhookData.speakers || null
                }
            })
            console.log('✅ Meeting marked as ended:', meeting.title)

            if (webhookData.transcript && !meeting.processed) {
                try {
                    const processed = await processMeetingTranscript(webhookData.transcript)

                    let transcriptText = ''

                    if (Array.isArray(webhookData.transcript)) {
                        transcriptText = webhookData.transcript
                            .map((item: {speaker?: string; words?: {word?: string}[]}) =>
                                `${item.speaker || 'Speaker'}: ${item.words?.map((w: {word?: string}) => w.word).join(' ') || ''}`)
                            .join('\n')
                    } else {
                        transcriptText = webhookData.transcript
                    }

                    try {
                        await sendMeetingSummaryEmail({
                            userEmail: meeting.user.email,
                            userName: meeting.user.name || 'User',
                            meetingTitle: meeting.title,
                            summary: processed.summary,
                            actionItems: processed.actionItems,
                            meetingId: meeting.id,
                            meetingDate: meeting.startTime.toLocaleDateString()
                        })

                        await prisma.meeting.update({
                            where: {
                                id: meeting.id
                            },
                            data: {
                                emailSent: true,
                                emailSentAt: new Date()
                            }
                        })
                    } catch (emailError) {
                        console.error('failed to send the email:', emailError)
                    }

                    await processTranscript(meeting.id, meeting.userId, transcriptText, meeting.title)

                    await prisma.meeting.update({
                        where: {
                            id: meeting.id
                        },
                        data: {
                            summary: processed.summary,
                            actionItems: processed.actionItems,
                            processed: true,
                            processedAt: new Date(),
                            ragProcessed: true,
                            ragProcessedAt: new Date()
                        }
                    })


                } catch (processingError) {
                    console.error('failed to process the transcript:', processingError)

                    await prisma.meeting.update({
                        where: {
                            id: meeting.id
                        },
                        data: {
                            processed: true,
                            processedAt: new Date(),
                            summary: 'processing failed. please check the transcript manually.',
                            actionItems: []
                        }
                    })
                }
            }

            console.log('🎉 Webhook processing completed successfully for meeting:', meeting.title)
            return NextResponse.json({
                success: true,
                message: 'meeting processed successfully',
                meetingId: meeting.id,
                meetingTitle: meeting.title,
                transcriptReceived: !!webhookData.transcript,
                recordingUploaded: recordingUrl !== webhookData.mp4
            })
        }
        return NextResponse.json({
            success: true,
            message: 'webhook recieved but no action needed bro'
        })
    } catch (error) {
        console.error('webhook processing errir:', error)
        return NextResponse.json({ error: 'internal server error' }, { status: 500 })
    }
}

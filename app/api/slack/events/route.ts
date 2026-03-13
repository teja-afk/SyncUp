import { App } from '@slack/bolt';
import { authorizeSlack } from './utils/slack-auth';
import { handleAppMention } from './handlers/app-mention';
import { handleMessage } from './handlers/message';
import { NextRequest, NextResponse } from 'next/server';
import { verifySlackSignature } from './utils/verifySlackSignature';
import { logger } from '@/lib/logger';
import { generateRequestId } from '@/lib/request-context';

// Lazy initialization to avoid build-time errors when env vars are not set
let app: App | null = null;

function getSlackApp(): App {
    if (!app) {
        if (!process.env.SLACK_SIGNING_SECRET) {
            throw new Error('SLACK_SIGNING_SECRET is not set');
        }
        app = new App({
            signingSecret: process.env.SLACK_SIGNING_SECRET,
            authorize: authorizeSlack
        });

        app.event('app_mention', handleAppMention);
        app.message(handleMessage);
    }
    return app;
}

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();
    const startTime = performance.now();

    try {
        logger.info('slack_events_request_received', {
            requestId,
            endpoint: '/api/slack/events',
            method: 'POST',
        });

        const body = await req.text();
        const bodyJson = JSON.parse(body);

        if (bodyJson.type === 'url_verification') {
            logger.info('slack_events_url_verification', {
                requestId,
            });
            return NextResponse.json({ challenge: bodyJson.challenge });
        }

        const signature = req.headers.get('x-slack-signature');
        const timestamp = req.headers.get('x-slack-request-timestamp');

        if (!signature || !timestamp) {
            logger.warn('slack_events_missing_signature', {
                requestId,
                hasSignature: !!signature,
                hasTimestamp: !!timestamp,
            });
            return NextResponse.json({ error: 'missing signature' }, { status: 401 });
        }

        if (!verifySlackSignature(body, signature, timestamp)) {
            logger.warn('slack_events_invalid_signature', {
                requestId,
            });
            return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
        }

        logger.info('slack_events_processing', {
            requestId,
            eventType: bodyJson.type,
        });

        await getSlackApp().processEvent({
            body: bodyJson,
            ack: async () => { }
        });

        const duration = performance.now() - startTime;
        logger.info('slack_events_success', {
            requestId,
            eventType: bodyJson.type,
            duration: Math.round(duration),
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        const duration = performance.now() - startTime;
        logger.error('slack_events_unexpected_error', error, {
            requestId,
            duration: Math.round(duration),
        });
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}

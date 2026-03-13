/**
 * Request Context Middleware
 * Tracks request metadata for logging and debugging
 */

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { LogContext, logger } from './logger';

export interface RequestContext {
  requestId: string;
  userId?: string;
  timestamp: number;
  startTime: number;
  endpoint: string;
  method: string;
}

// Store request context in async local storage equivalent
const contextMap = new Map<string, RequestContext>();
const MAX_CONTEXTS = 10000;

export function createRequestContext(
  endpoint: string,
  method: string,
  userId?: string
): RequestContext {
  const context: RequestContext = {
    requestId: randomUUID(),
    userId,
    timestamp: Date.now(),
    startTime: performance.now(),
    endpoint,
    method,
  };

  contextMap.set(context.requestId, context);

  // Cleanup old contexts
  if (contextMap.size > MAX_CONTEXTS) {
    const firstKey = contextMap.keys().next().value;
    if (firstKey) {
      contextMap.delete(firstKey);
    }
  }

  return context;
}

export function getRequestContext(requestId: string): RequestContext | undefined {
  return contextMap.get(requestId);
}

export function getContextForLogging(
  requestId: string,
  additionalContext?: Partial<LogContext>
): LogContext {
  const context = getRequestContext(requestId);
  const duration = context ? performance.now() - context.startTime : undefined;

  return {
    requestId,
    userId: context?.userId,
    endpoint: context?.endpoint,
    method: context?.method,
    duration: duration ? Math.round(duration) : undefined,
    ...additionalContext,
  };
}

/**
 * Middleware to add request ID and logging
 */
export function withRequestLogging(
  handler: (
    req: NextRequest,
    context: { requestId: string; userId?: string }
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, params?: any) => {
    const requestId = randomUUID();
    const endpoint = new URL(req.url).pathname;
    const method = req.method;

    // Create context
    const context = createRequestContext(endpoint, method);

    logger.info('request_started', {
      requestId: context.requestId,
      endpoint,
      method,
      timestamp: new Date(context.timestamp).toISOString(),
    });

    try {
      const response = await handler(req, { requestId: context.requestId });

      const duration = performance.now() - context.startTime;
      logger.info('request_completed', {
        requestId: context.requestId,
        endpoint,
        method,
        statusCode: response.status,
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
      });

      // Add request ID to response headers
      response.headers.set('X-Request-Id', context.requestId);

      return response;
    } catch (error) {
      const duration = performance.now() - context.startTime;
      logger.error('request_failed', error, {
        requestId: context.requestId,
        endpoint,
        method,
        duration: Math.round(duration),
      });

      throw error;
    } finally {
      // Cleanup context
      contextMap.delete(context.requestId);
    }
  };
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Alias for generateRequestId
 */
export const getRequestId = generateRequestId;

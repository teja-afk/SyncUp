/**
 * Input Validation Schemas
 * Comprehensive validation schemas for all API endpoints
 */

import { z } from 'zod';

// ============================================================================
// CORE SCHEMAS
// ============================================================================

// Base types
export const BaseSchemas = {
  id: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().min(1, 'Token is required'),
  timestamp: z.coerce.date(),
  url: z.string().url('Invalid URL format'),
};

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserSchemas = {
  create: z.object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
    name: z.string().min(1).max(100),
    calendarProvider: z.enum(['google', 'microsoft', 'apple']).optional(),
  }),

  update: z.object({
    email: BaseSchemas.email.optional(),
    name: z.string().min(1).max(100).optional(),
    preferences: z.record(z.string(), z.unknown()).optional(),
  }),

  login: z.object({
    email: BaseSchemas.email,
    password: z.string().min(1),
  }),

  refresh: z.object({
    refreshToken: BaseSchemas.token,
  }),

  settings: z.object({
    timezone: z.string().optional(),
    language: z.string().optional(),
    notifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark']).optional(),
  }),
};

// ============================================================================
// MEETING SCHEMAS
// ============================================================================

export const MeetingSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(500),
    description: z.string().max(5000).optional(),
    startTime: BaseSchemas.timestamp,
    endTime: BaseSchemas.timestamp,
    attendees: z.array(BaseSchemas.email).min(1),
    location: z.string().max(500).optional(),
    isVirtual: z.boolean().optional(),
    meetingLink: BaseSchemas.url.optional(),
  }).refine(data => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  }),

  update: z.object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).optional(),
    startTime: BaseSchemas.timestamp.optional(),
    endTime: BaseSchemas.timestamp.optional(),
    attendees: z.array(BaseSchemas.email).optional(),
    location: z.string().max(500).optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  }),

  notes: z.object({
    content: z.string().max(50000),
    aiGenerated: z.boolean().optional(),
    summary: z.string().max(2000).optional(),
  }),

  query: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
    startDate: BaseSchemas.timestamp.optional(),
    endDate: BaseSchemas.timestamp.optional(),
  }),
};

// ============================================================================
// CHAT/RAG SCHEMAS
// ============================================================================

export const ChatSchemas = {
  message: z.object({
    conversationId: BaseSchemas.id,
    message: z.string().min(1, 'Message cannot be empty').max(5000),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    context: z.array(z.string()).optional(),
  }),

  conversation: z.object({
    title: z.string().min(1).max(200).optional(),
    meetingId: BaseSchemas.id.optional(),
    participants: z.array(BaseSchemas.email).optional(),
  }),

  ragQuery: z.object({
    query: z.string().min(1, 'Query cannot be empty').max(1000),
    meetingId: BaseSchemas.id.optional(),
    topK: z.number().int().min(1).max(20).optional().default(5),
    threshold: z.number().min(0).max(1).optional().default(0.5),
  }),

  search: z.object({
    q: z.string().min(1, 'Search query is required').max(500),
    type: z.enum(['meetings', 'notes', 'chats']).optional(),
    limit: z.number().int().min(1).max(100).optional().default(20),
  }),
};

// ============================================================================
// SLACK SCHEMAS
// ============================================================================

export const SlackSchemas = {
  oauth: z.object({
    code: z.string().min(1),
    state: z.string().min(1),
  }),

  event: z.object({
    type: z.string(),
    challenge: z.string().optional(),
    event: z.record(z.string(), z.unknown()).optional(),
  }),

  postMeeting: z.object({
    channelId: z.string().min(1),
    meetingId: BaseSchemas.id,
    includeNotes: z.boolean().optional().default(true),
    includeAttendees: z.boolean().optional().default(true),
  }),

  command: z.object({
    token: z.string().min(1),
    teamId: z.string().min(1),
    userId: z.string().min(1),
    command: z.string().min(1),
    text: z.string().optional(),
  }),
};

// ============================================================================
// CALENDAR SCHEMAS
// ============================================================================

export const CalendarSchemas = {
  sync: z.object({
    provider: z.enum(['google', 'microsoft', 'apple']),
    timeMin: BaseSchemas.timestamp.optional(),
    timeMax: BaseSchemas.timestamp.optional(),
    maxResults: z.number().int().min(1).max(100).optional().default(50),
  }),

  status: z.object({
    status: z.enum(['available', 'busy', 'doNotDisturb', 'away']),
    message: z.string().max(200).optional(),
    expiresAt: BaseSchemas.timestamp.optional(),
  }),

  preferences: z.object({
    autoSync: z.boolean().optional(),
    syncInterval: z.number().int().min(5).max(1440).optional(), // minutes
    includeDeclined: z.boolean().optional(),
    timezone: z.string().optional(),
  }),
};

// ============================================================================
// API KEY SCHEMAS
// ============================================================================

export const ApiKeySchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    expiresAt: BaseSchemas.timestamp.optional(),
    permissions: z.array(z.string()).optional(),
  }),

  rotate: z.object({
    keyId: BaseSchemas.id,
  }),
};

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============================================================================
// ERROR RESPONSE SCHEMAS
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    timestamp: BaseSchemas.timestamp.optional(),
  }),
});

// ============================================================================
// SUCCESSFUL RESPONSE SCHEMAS
// ============================================================================

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
  timestamp: BaseSchemas.timestamp.optional(),
});

// ============================================================================
// BATCH OPERATION SCHEMAS
// ============================================================================

export const BatchSchemas = {
  create: z.object({
    operations: z.array(z.object({
      type: z.string(),
      payload: z.record(z.string(), z.unknown()),
    })).min(1).max(100),
  }),

  query: z.object({
    queries: z.array(z.object({
      endpoint: z.string(),
      params: z.record(z.string(), z.unknown()).optional(),
    })).min(1).max(50),
  }),
};

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export function validateRequest<T>(
  schema: z.ZodSchema,
  data: unknown
): { valid: boolean; data?: T; errors?: string[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(
      (error: z.ZodIssue) => `${error.path.join('.')}: ${error.message}`
    );
    return { valid: false, errors };
  }

  return { valid: true, data: result.data as T };
}

export function getValidationError(
  schema: z.ZodSchema,
  data: unknown
): string | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    const first = result.error.issues[0];
    return `${first.path.join('.')}: ${first.message}`;
  }

  return null;
}

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

export const AllSchemas = {
  Base: BaseSchemas,
  User: UserSchemas,
  Meeting: MeetingSchemas,
  Chat: ChatSchemas,
  Slack: SlackSchemas,
  Calendar: CalendarSchemas,
  ApiKey: ApiKeySchemas,
  Pagination: PaginationSchema,
  ErrorResponse: ErrorResponseSchema,
  SuccessResponse: SuccessResponseSchema,
  Batch: BatchSchemas,
};

// Alias for backwards compatibility
export const ValidationSchemas = AllSchemas;

export default AllSchemas;

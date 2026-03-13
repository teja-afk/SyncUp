/**
 * Custom Error Classes
 * Centralized error handling with error codes and user-friendly messages
 */

export enum ErrorCode {
  // Validation errors (4000-4099)
  VALIDATION_FAILED = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  INVALID_FORMAT = 'VAL_003',

  // Authentication errors (4010-4019)
  NOT_AUTHENTICATED = 'AUTH_001',
  UNAUTHORIZED = 'AUTH_002',
  SESSION_EXPIRED = 'AUTH_003',

  // Meeting errors (4020-4049)
  MEETING_NOT_FOUND = 'MEETING_001',
  MEETING_NOT_PROCESSED = 'MEETING_002',
  TRANSCRIPT_NOT_READY = 'MEETING_003',
  INVALID_MEETING_TIME = 'MEETING_004',
  MEETING_ALREADY_EXISTS = 'MEETING_005',

  // RAG errors (4050-4079)
  RAG_NO_CONTEXT = 'RAG_001',
  RAG_PROCESSING_FAILED = 'RAG_002',
  RAG_SEARCH_FAILED = 'RAG_003',
  EMBEDDING_FAILED = 'RAG_004',
  PINECONE_CONNECTION_ERROR = 'RAG_005',

  // Integration errors (4080-4099)
  INTEGRATION_NOT_FOUND = 'INT_001',
  INTEGRATION_AUTH_FAILED = 'INT_002',
  INTEGRATION_SYNC_FAILED = 'INT_003',
  CALENDAR_SYNC_ERROR = 'INT_004',
  SLACK_SEND_ERROR = 'INT_005',
  INTEGRATION_ERROR = 'INT_006',
  INTEGRATION_NOT_CONFIGURED = 'INT_007',

  // User errors
  USER_NOT_FOUND = 'USER_001',

  // Rate limit errors (4290-4299)
  RATE_LIMIT_EXCEEDED = 'LIMIT_001',
  QUOTA_EXCEEDED = 'LIMIT_002',

  // Database errors (5000-5099)
  DATABASE_ERROR = 'DB_001',
  DATABASE_CONNECTION_ERROR = 'DB_002',
  TRANSACTION_FAILED = 'DB_003',

  // External service errors (5100-5199)
  EXTERNAL_SERVICE_ERROR = 'EXT_001',
  TIMEOUT_ERROR = 'EXT_002',
  NETWORK_ERROR = 'EXT_003',

  // Ollama/AI errors (5200-5299)
  OLLAMA_CONNECTION_ERROR = 'AI_001',
  MODEL_NOT_AVAILABLE = 'AI_002',
  AI_PROCESSING_ERROR = 'AI_003',

  // Unknown error
  INTERNAL_SERVER_ERROR = 'SERVER_001',
}

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  userMessage?: string;
  statusCode?: number;
  details?: Record<string, any>;
  originalError?: Error;
}

/**
 * Custom Application Error
 */
export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  userMessage: string;
  details?: Record<string, any>;
  originalError?: Error;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.userMessage = options.userMessage || options.message;
    this.details = options.details;
    this.originalError = options.originalError;

    // Capture stack trace
    Error.captureStackTrace(this, AppError);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Error response builder
 */
export function createErrorResponse(error: Error | AppError, requestId?: string) {
  if (error instanceof AppError) {
    return {
      error: error.userMessage,
      code: error.code,
      details: error.details,
      requestId,
      timestamp: new Date().toISOString(),
      statusCode: error.statusCode,
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    requestId,
    timestamp: new Date().toISOString(),
    statusCode: 500,
  };
}

/**
 * Predefined error scenarios
 */
export const ErrorMessages = {
  // Validation
  VALIDATION_FAILED: (field: string) => ({
    code: ErrorCode.VALIDATION_FAILED,
    message: `Validation failed for field: ${field}`,
    userMessage: `Invalid ${field}. Please check your input.`,
    statusCode: 400,
  }),

  // Authentication
  NOT_AUTHENTICATED: {
    code: ErrorCode.NOT_AUTHENTICATED,
    message: 'User not authenticated',
    userMessage: 'Please sign in to continue',
    statusCode: 401,
  },

  UNAUTHORIZED: {
    code: ErrorCode.UNAUTHORIZED,
    message: 'User not authorized for this action',
    userMessage: 'You do not have permission to perform this action',
    statusCode: 403,
  },

  // Meetings
  MEETING_NOT_FOUND: {
    code: ErrorCode.MEETING_NOT_FOUND,
    message: 'Meeting not found',
    userMessage: 'The meeting you are looking for does not exist',
    statusCode: 404,
  },

  MEETING_NOT_PROCESSED: {
    code: ErrorCode.MEETING_NOT_PROCESSED,
    message: 'Meeting transcript is still being processed',
    userMessage: 'Meeting is still being processed. Please wait 2-3 minutes and try again.',
    statusCode: 202,
  },

  TRANSCRIPT_NOT_READY: {
    code: ErrorCode.TRANSCRIPT_NOT_READY,
    message: 'Transcript not yet ready',
    userMessage: 'The transcript for this meeting is still being prepared. Please check back in a few moments.',
    statusCode: 202,
  },

  // RAG
  RAG_NO_CONTEXT: {
    code: ErrorCode.RAG_NO_CONTEXT,
    message: 'No relevant meeting content found',
    userMessage: 'No relevant information found in your meetings. Try asking about different topics or check if meetings have been processed.',
    statusCode: 404,
  },

  RAG_PROCESSING_FAILED: {
    code: ErrorCode.RAG_PROCESSING_FAILED,
    message: 'RAG processing failed',
    userMessage: 'Failed to process meeting content. Please try again later.',
    statusCode: 500,
  },

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: (limit: number, window: string) => ({
    code: ErrorCode.RATE_LIMIT_EXCEEDED,
    message: `Rate limit exceeded: ${limit} requests per ${window}`,
    userMessage: `You have exceeded your rate limit. Please wait before trying again.`,
    statusCode: 429,
  }),

  QUOTA_EXCEEDED: (remaining: number) => ({
    code: ErrorCode.QUOTA_EXCEEDED,
    message: `Quota exceeded. Remaining: ${remaining}`,
    userMessage: `You have reached your usage limit for this month. Remaining: ${remaining}`,
    statusCode: 429,
  }),

  // Database
  DATABASE_ERROR: {
    code: ErrorCode.DATABASE_ERROR,
    message: 'Database operation failed',
    userMessage: 'A database error occurred. Please try again later.',
    statusCode: 500,
  },

  // External Services
  EXTERNAL_SERVICE_ERROR: (service: string) => ({
    code: ErrorCode.EXTERNAL_SERVICE_ERROR,
    message: `External service error: ${service}`,
    userMessage: `The ${service} service is temporarily unavailable. Please try again later.`,
    statusCode: 503,
  }),

  TIMEOUT_ERROR: {
    code: ErrorCode.TIMEOUT_ERROR,
    message: 'Operation timed out',
    userMessage: 'The operation took too long. Please try again.',
    statusCode: 504,
  },

  // Ollama/AI
  OLLAMA_CONNECTION_ERROR: {
    code: ErrorCode.OLLAMA_CONNECTION_ERROR,
    message: 'Cannot connect to Ollama service',
    userMessage: 'AI service is temporarily unavailable. Please try again later.',
    statusCode: 503,
  },

  MODEL_NOT_AVAILABLE: (model: string) => ({
    code: ErrorCode.MODEL_NOT_AVAILABLE,
    message: `Model not available: ${model}`,
    userMessage: `The AI model is not available. Please try again later.`,
    statusCode: 503,
  }),

  // Integration errors
  INTEGRATION_ERROR: {
    code: ErrorCode.INTEGRATION_ERROR,
    message: 'Integration error occurred',
    userMessage: 'An error occurred with this integration. Please try again later.',
    statusCode: 500,
  },

  INTEGRATION_NOT_CONFIGURED: {
    code: ErrorCode.INTEGRATION_NOT_CONFIGURED,
    message: 'Integration not configured',
    userMessage: 'This integration is not set up. Please configure it in your settings.',
    statusCode: 400,
  },

  // User errors
  USER_NOT_FOUND: {
    code: ErrorCode.USER_NOT_FOUND,
    message: 'User not found',
    userMessage: 'User not found',
    statusCode: 404,
  },

  // Alias for internal server error
  INTERNAL_ERROR: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    userMessage: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  },

  // Generic
  INTERNAL_SERVER_ERROR: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    userMessage: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  },
};

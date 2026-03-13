# SyncUp Application - Class Diagram

## 1. Database Models (Prisma)

### User
---
- `id: String` (PK)
- `clerkId: String` (unique)
- `email: String?`
- `name: String?`
- `botName: String?`
- `botImageUrl: String?`
- `googleAccessToken: String?`
- `googleRefreshToken: String?`
- `googleTokenExpiry: DateTime?`
- `calenderConnected: Boolean`
- `gmailConnected: Boolean`
- `gmailAccessToken: String?`
- `gmailRefreshToken: String?`
- `gmailTokenExpiry: DateTime?`
- `slackUserId: String?`
- `slackTeamId: String?`
- `slackConnected: Boolean`
- `preferredChannelId: String?`
- `preferredChannelName: String?`
- `emailFilterDomains: String?`
- `createdAt: DateTime`
- `updatedAt: DateTime`
---
+ meetings: Meeting[]
+ emails: Email[]

### Meeting
---
- `id: String` (PK)
- `userId: String` (FK)
- `title: String`
- `description: String?`
- `meetingUrl: String?`
- `startTime: DateTime`
- `endTime: DateTime`
- `attendees: Json?`
- `calendarEventId: String?` (unique)
- `isFromCalendar: Boolean`
- `botScheduled: Boolean`
- `botSent: Boolean`
- `botId: String?`
- `botJoinedAt: DateTime?`
- `meetingEnded: Boolean`
- `transcriptReady: Boolean`
- `transcript: Json?`
- `recordingUrl: String?`
- `speakers: Json?`
- `summary: String?`
- `actionItems: Json?`
- `processed: Boolean`
- `processedAt: DateTime?`
- `emailSent: Boolean`
- `emailSentAt: DateTime?`
- `ragProcessed: Boolean`
- `ragProcessedAt: DateTime?`
- `createdAt: DateTime`
- `updatedAt: DateTime`
---
+ user: User
+ transcriptChunks: TranscriptChunk[]

### TranscriptChunk
---
- `id: String` (PK)
- `meetingId: String` (FK)
- `chunkIndex: Int`
- `content: String`
- `speakerName: String?`
- `vectorId: String?`
- `createdAt: DateTime`
---
+ meeting: Meeting

### Email
---
- `id: String` (PK)
- `gmailId: String` (unique)
- `threadId: String?`
- `subject: String`
- `fromName: String?`
- `fromEmail: String`
- `toEmail: String`
- `snippet: String?`
- `body: String?`
- `bodyHtml: String?`
- `receivedAt: DateTime`
- `summarizedAt: DateTime?`
- `summary: String?`
- `actionItems: Json?`
- `domain: String`
- `isRead: Boolean`
- `userId: String` (FK)
- `createdAt: DateTime`
- `updatedAt: DateTime`
---
+ user: User

### SlackInstallation
---
- `id: String` (PK)
- `teamId: String` (unique)
- `teamName: String`
- `botToken: String`
- `installedBy: String`
- `installerName: String?`
- `active: Boolean`
- `createdAt: DateTime`
- `updatedAt: DateTime`

### UserIntegration
---
- `id: String` (PK)
- `userId: String`
- `platform: String`
- `accessToken: String`
- `refreshToken: String?`
- `expiresAt: DateTime?`
- `boardId: String?`
- `boardName: String?`
- `projectId: String?`
- `projectName: String?`
- `workspaceId: String?`
- `domain: String?`
- `createdAt: DateTime`
- `updatedAt: DateTime`
---

## 2. Core Library Classes

### CacheManager
---
- `cache: Map<string, CacheEntry<any>>`
- `tags: Map<string, Set<string>>`
- `cleanupInterval: NodeJS.Timeout | null`
---
+ `constructor()`
+ `get<T>(key: string): T | null`
+ `set<T>(key: string, value: T, options?: CacheOptions): void`
+ `delete(key: string): boolean`
+ `has(key: string): boolean`
+ `invalidateByTag(tag: string): void`
+ `invalidateTaggedKeys(key: string): void`
+ `clear(): void`
+ `startCleanup(): void`
+ `stopCleanup(): void`
+ `getStats(): CacheStats`

### AppError
---
- `code: ErrorCode`
- `statusCode: number`
- `userMessage: string`
- `details?: Record<string, any>`
- `originalError?: Error`
---
+ `constructor(options: AppErrorOptions)`

### ErrorCode (Enum)
---
- `VALIDATION_FAILED = 'VAL_001'`
- `MISSING_REQUIRED_FIELD = 'VAL_002'`
- `INVALID_FORMAT = 'VAL_003'`
- `NOT_AUTHENTICATED = 'AUTH_001'`
- `UNAUTHORIZED = 'AUTH_002'`
- `SESSION_EXPIRED = 'AUTH_003'`
- `MEETING_NOT_FOUND = 'MEETING_001'`
- `MEETING_NOT_PROCESSED = 'MEETING_002'`
- `RAG_NO_CONTEXT = 'RAG_001'`
- `RAG_PROCESSING_FAILED = 'RAG_002'`
- `INTEGRATION_AUTH_FAILED = 'INT_002'`
- `RATE_LIMIT_EXCEEDED = 'LIMIT_001'`
- `DATABASE_ERROR = 'DB_001'`
- `OLLAMA_CONNECTION_ERROR = 'AI_001'`
- `INTERNAL_SERVER_ERROR = 'SERVER_001'`

### RateLimitStore
---
- `rateLimitStore: Map<string, RateLimitEntry>`
- `CLEANUP_INTERVAL: number`
---
+ `checkRateLimit(userId: string, limits: RateLimit): number`
+ `resetRateLimit(userId: string): void`
+ `getRateLimitStatus(userId: string, limits: RateLimit)`

## 3. Authentication & Authorization

### JWTPayload (Interface)
---
- `userId: string`
- `email: string`
- `role: UserRole`
- `permissions: Permission[]`
- `iat?: number`
- `exp?: number`
- `iss?: string`
- `sub?: string`

### OAuthToken (Interface)
---
- `accessToken: string`
- `refreshToken: string`
- `tokenType: string`
- `expiresIn: number`
- `scope: string[]`

### SessionUser (Interface)
---
- `id: string`
- `email: string`
- `name?: string`
- `role: UserRole`
- `permissions: Permission[]`
- `lastLogin?: Date`
- `loginAttempts: number`
- `isLocked: boolean`

### UserRole (Type)
---
- `'admin' | 'user' | 'viewer' | 'bot'`

### Permission (Type)
---
- `'read' | 'write' | 'delete' | 'admin' | 'manage_users' | 'manage_meetings' | 'manage_settings'`

### RBACRule (Interface)
---
- `role: UserRole`
- `resource: string`
- `actions: Permission[]`
- `conditions?: Record<string, unknown>`

---

## 4. AI & RAG Services

### OllamaClient
---
- `OLLAMA_BASE_URL: string`
- `EMBEDDING_MODEL: string`
- `CHAT_MODELS: string[]`
- `OLLAMA_TIMEOUT: number`
---
+ `queryOllama(model: string, payload: Record<string, unknown>): Promise<unknown>`
+ `generateEmbedding(text: string): Promise<number[]>`
+ `generateEmbeddings(texts: string[], concurrency?: number): Promise<number[][]>`
+ `chatWithAI(systemPrompt: string, userPrompt: string): Promise<string>`
+ `checkModelAvailability(model: string): Promise<boolean>`

### RAGService
---
- `processTranscript(meetingId: string, userId: string, transcript: string, meetingTitle?: string): Promise<void>`
- `chatWithMeeting(userId: string, meetingId: string, question: string): Promise<ChatResult>`
- `chatWithAllMeetings(userId: string, question: string): Promise<ChatResult>`
- `searchVectors(embedding: number[], filter: object, topK: number): Promise<SearchResult[]>`
- `saveVectors(vectors: Vector[]): Promise<void>`

### AIProcessor
---
- `generateMeetingTitle(transcript: any): Promise<string>`
- `generateSummary(transcript: any): Promise<string>`
- `extractActionItems(transcript: any): Promise<ActionItem[]>`
- `extractTextFromTranscript(transcript: any): string`

### EmailProcessor
---
- `processEmailWithAI(email: EmailInput): Promise<EmailAIResult>`
- `summarizeEmail(body: string): Promise<string>`
- `extractEmailActionItems(body: string): Promise<string[]>`

---

## 5. Integration Services

### GoogleCalendarService
---
- `fetchGoogleCalendarEvents(userId: string): Promise<GoogleCalendarEvent[]>`
- `createCalendarEvent(userId: string, event: CalendarEvent): Promise<GoogleCalendarEvent>`
- `updateCalendarEvent(userId: string, eventId: string, event: Partial<CalendarEvent>): Promise<GoogleCalendarEvent>`
- `deleteCalendarEvent(userId: string, eventId: string): Promise<void>`

### GoogleCalendarEvent (Interface)
---
- `id: string`
- `summary?: string`
- `start?: { dateTime?: string; date?: string }`
- `end?: { dateTime?: string; date?: string }`
- `attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>`
- `hangoutLink?: string`
- `location?: string`

### GmailService
---
- `fetchEmails(userId: string, query?: string): Promise<Email[]>`
- `getEmail(gmailId: string): Promise<Email>`
- `markAsRead(gmailId: string): Promise<void>`

### SlackService
---
- `postMessage(channel: string, message: string): Promise<void>`
- `postMeetingSummary(channel: string, meeting: Meeting): Promise<void>`
- `sendDirectMessage(userId: string, message: string): Promise<void>`

### JiraService
---
- `createIssue(projectKey: string, issue: JiraIssue): Promise<JiraIssue>`
- `getIssues(projectKey: string): Promise<JiraIssue[]>`
- `addComment(issueKey: string, comment: string): Promise<void>`

### AsanaService
---
- `createTask(projectId: string, task: AsanaTask): Promise<AsanaTask>`
- `getTasks(projectId: string): Promise<AsanaTask[]>`
- `completeTask(taskId: string): Promise<void>`

### TrelloService
---
- `createCard(boardId: string, card: TrelloCard): Promise<TrelloCard>`
- `getCards(boardId: string): Promise<TrelloCard[]>`
- `updateCard(cardId: string, updates: Partial<TrelloCard>): Promise<TrelloCard>`

---

## 6. Configuration & Validation

### EnvConfig (Interface)
---
- `database: { url: string }`
- `clerk: { publishableKey: string; secretKey: string; webhookSecret: string }`
- `google: { clientId: string; clientSecret: string; redirectUri: string }`
- `pinecone: { apiKey: string; indexName: string }`
- `aws: { region: string; accessKeyId: string; secretAccessKey: string; s3Bucket: string }`
- `resend: { apiKey: string }`
- `slack?: { clientId?: string; clientSecret?: string }`
- `app: { url: string; environment: string; nodeEnv: string }`
---
+ `getConfig(): EnvConfig`
+ `resetConfig(): void`
+ `validateEnv(): EnvConfig`

### ValidationSchemas (Object)
---
- `email: ZodSchema`
- `password: ZodSchema`
- `username: ZodSchema`
- `meetingTitle: ZodSchema`
- `meetingDescription: ZodSchema`
- `meetingDate: ZodSchema`
- `chatMessage: ZodSchema`
- `conversationId: ZodSchema`
- `uuid: ZodSchema`
- `positiveInt: ZodSchema`
- `safeString: ZodSchema`
---
+ `validateInput<T>(schema: ZodSchema, data: unknown): T`
+ `safeValidate<T>(schema: ZodSchema, data: unknown): ValidationResult<T>`

### UserSchemas (Object)
---
- `create: ZodSchema`
- `update: ZodSchema`
- `login: ZodSchema`
- `refresh: ZodSchema`
- `settings: ZodSchema`

### MeetingSchemas (Object)
---
- `create: ZodSchema`
- `update: ZodSchema`
- `delete: ZodSchema`
- `query: ZodSchema`

---

## 7. Integration Type Definitions

### IntegrationConfig (Interface)
---
- `platform: 'trello' | 'jira' | 'asana'`
- `connected: boolean`
- `boardName?: string`
- `projectName?: string`

### ActionItemData (Interface)
---
- `title: string`
- `description?: string`
- `dueDate?: string`
- `assignee?: string`

### ActionItem (Interface)
---
- `id: number`
- `text: string`

### MeetingActionItems (Interface)
---
- `actionItems?: ActionItem[] | null`

---

## 8. UI Components

### LiveTranscriber
---
- Manages real-time transcription of meetings
- Handles WebSocket connections for audio streaming
- Processes and displays transcription segments

### ThemeProvider
---
- Provides theme context (light/dark mode)
- Manages CSS variables for theming

### UI Components (shadcn/ui)
---
- Button
- Card
- Input
- Checkbox
- Select
- DropdownMenu
- Sheet
- Sidebar
- Switch
- Tooltip
- Badge
- Label
- Separator
- Skeleton
- Sonner (toast notifications)

---

## 9. Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐       ┌─────────────┐       ┌─────────────────┐            │
│   │  User   │ 1───* │   Meeting    │ 1───* │ TranscriptChunk │            │
│   └─────────┘       └─────────────┘       └─────────────────┘            │
│        │                  │                                                  │
│        │                  │                                                  │
│   ┌────┴────┐       ┌─────┴─────┐                                          │
│   │  Email  │       │SlackInstall│                                          │
│   └─────────┘       └───────────┘                                          │
│                                                                             │
│   ┌───────────────────┐                                                     │
│   │UserIntegration    │                                                     │
│   └───────────────────┘                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  │   CacheManager  │     │   AppError      │     │ RateLimitStore  │      │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘      │
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  │ Auth Utilities │     │Security Utils   │     │Validation Utils │      │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘      │
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  │  Config Manager │     │  Email Service  │     │  Logger         │      │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI/ML LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  │  OllamaClient  │────▶│    RAGService   │◀────│   AIProcessor   │      │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘      │
│         │                        │                        │                 │
│         │                        │                        │                 │
│  ┌──────┴──────┐         ┌──────┴──────┐         ┌───────┴───────┐        │
│  │  OpenAI     │         │   Pinecone  │         │EmailProcessor │        │
│  └─────────────┘         └─────────────┘         └───────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATION LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Google    │  │    Gmail     │  │    Slack     │  │    Jira      │    │
│  │  Calendar   │  │              │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                       │
│  │    Asana    │  │   Trello     │  │   Refresh    │                       │
│  │              │  │              │  │   Token      │                       │
│  └──────────────┘  └──────────────┘  └──────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API Routes                                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  /api/meetings/*        - Meeting CRUD operations                  │   │
│  │  /api/rag/*             - RAG chat operations                      │   │
│  │  /api/integrations/*    - Third-party integrations                 │   │
│  │  /api/user/*            - User settings and preferences             │   │
│  │  /api/emails/*          - Email fetching and summarization         │   │
│  │  /api/slack/*          - Slack webhooks and OAuth                  │   │
│  │  /api/admin/*           - Admin operations                          │   │
│  │  /api/webhooks/*        - External webhooks                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Pages & Components                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  /app/(auth)/*           - Authentication pages                     │   │
│  │  /app/chat/*             - Chat interface                           │   │
│  │  /app/components/*      - Reusable UI components                   │   │
│  │  components/ui/*         - shadcn/ui components                     │   │
│  │  components/email/*     - Email templates                           │   │
│  │  components/landing/*   - Landing page components                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Key Module Dependencies

```
                    ┌─────────────────┐
                    │   lib/db.ts     │
                    │   (Prisma)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   lib/rag.ts  │   │   lib/auth.ts  │   │  lib/security   │
└───────┬───────┘   └────────┬────────┘   └────────┬────────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ lib/openai.ts │   │  lib/errors.ts  │   │lib/validation  │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │
        ▼
┌───────────────┐
│lib/pinecone.ts│
└───────────────┘
```

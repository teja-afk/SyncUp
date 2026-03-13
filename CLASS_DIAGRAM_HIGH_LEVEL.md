# SyncUp - High-Level Class Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    SYNCUP APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              CLIENT LAYER                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │  │
│  │  │  Web App    │  │  Chat UI    │  │  Dashboard  │  │  Mobile Responsive  │ │  │
│  │  │  (Next.js)  │  │  Interface  │  │   Panel     │  │       Design       │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │  │
│  │         │                │                │                                   │  │
│  └─────────│────────────────│────────────────│───────────────────────────────────┘  │
│            │                │                │                                    │
│            ▼                ▼                ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              API GATEWAY LAYER                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Next.js API Routes                                  │  │  │
│  │  │  /meetings  /rag  /integrations  /emails  /slack  /user  /admin        │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                    │                                           │  │
│  │         ┌──────────────────────────┼──────────────────────────┐                │  │
│  │         │                          │                          │                │  │
│  │         ▼                          ▼                          ▼                │  │
│  │  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐          │  │
│  │  │  Middleware  │          │   Auth      │          │ Rate Limit  │          │  │
│  │  │  (Clerk)     │          │  (JWT/RBAC) │          │  Security   │          │  │
│  │  └─────────────┘          └─────────────┘          └─────────────┘          │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                          │                                           │
│                                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                             SERVICE LAYER                                      │  │
│  │                                                                                 │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────────────────┐  │  │
│  │  │   AI/ML SERVICES       │  │         INTEGRATION SERVICES                │  │  │
│  │  │  ┌──────────────────┐  │  │  ┌─────────┐ ┌───────┐ ┌───────┐ ┌───────┐ │  │  │
│  │  │  │   RAG Engine     │  │  │  │ Google  │ │ Gmail │ │ Slack │ │ Jira  │ │  │  │
│  │  │  │  (Retrieval +    │  │  │  │Calendar │ │       │ │       │ │       │ │  │  │
│  │  │  │   Generation)   │  │  │  └─────────┘ └───────┘ └───────┘ └───────┘ │  │  │
│  │  │  └──────────────────┘  │  │  ┌───────┐ ┌───────┐ ┌───────┐              │  │  │
│  │  │  ┌──────────────────┐  │  │  │Asana  │ │Trello │ │ Resend│              │  │  │
│  │  │  │   Ollama AI      │  │  │  │       │ │       │ │ (Email)│             │  │  │
│  │  │  │  (Local LLM)     │  │  │  └───────┘ └───────┘ └───────┘              │  │  │
│  │  │  └──────────────────┘  │  │  ┌─────────────────────────────────────────┐  │  │  │
│  │  │  ┌──────────────────┐  │  │  │        Token Management                │  │  │  │
│  │  │  │  Pinecone        │  │  │  │    (OAuth Refresh Handlers)            │  │  │  │
│  │  │  │  (Vector Store)  │  │  │  └─────────────────────────────────────────┘  │  │  │
│  │  │  └──────────────────┘  │  └─────────────────────────────────────────────┘  │  │
│  │  └────────────────────────┘                                                   │  │
│  │                                                                                 │  │
│  │  ┌────────────────────────┐  ┌─────────────────────────────────────────────┐  │  │
│  │  │   UTILITY SERVICES    │  │         CORE SERVICES                       │  │  │
│  │  │  ┌──────────────────┐ │  │  ┌─────────────┐ ┌─────────────┐ ┌────────┐│  │  │
│  │  │  │   Cache Manager  │ │  │  │   Meeting  │ │    Email    │ │  User  ││  │  │
│  │  │  │   (In-Memory)    │ │  │  │   Service  │ │   Service   │ │Service ││  │  │
│  │  │  └──────────────────┘ │  │  └─────────────┘ └─────────────┘ └────────┘│  │  │
│  │  │  ┌──────────────────┐ │  │  ┌─────────────┐ ┌─────────────┐ ┌────────┐│  │  │
│  │  │  │    Logger        │ │  │  │   Slack    │ │    Trans-   │ │  Web-  ││  │  │
│  │  │  │   (Monitoring)  │ │  │  │   Service  │ │   scriber   │ │  hook  ││  │  │
│  │  │  └──────────────────┘ │  │  └─────────────┘ └─────────────┘ └────────┘│  │  │
│  │  │  ┌──────────────────┐ │  │                                             │  │  │
│  │  │  │   Validation     │ │  │                                             │  │  │
│  │  │  │   (Zod Schemas)  │ │  │                                             │  │  │
│  │  │  └──────────────────┘ │  │                                             │  │  │
│  │  └────────────────────────┘  └─────────────────────────────────────────────┘  │  │
│  │                                                                                 │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                         │
│                                           ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              DATA LAYER                                        │  │
│  │                                                                                 │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    PostgreSQL Database (Prisma ORM)                     │  │  │
│  │  │                                                                          │  │  │
│  │  │  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌───────┐ │  │  │
│  │  │  │  User   │  │ Meeting  │  │ Transcript│  │   Email    │  │Slack  │ │  │  │
│  │  │  │         │  │          │  │  Chunk    │  │            │  │Install│ │  │  │
│  │  │  └─────────┘  └──────────┘  └───────────┘  └────────────┘  └───────┘ │  │  │
│  │  │      │              │            │              │              │         │  │  │
│  │  │      │              │            │              │              │         │  │  │
│  │  │      └──────────────┼────────────┼──────────────┼──────────────┘         │  │  │
│  │  │                       │            │            │                            │  │  │
│  │  │              ┌────────┴───────────┴────────────┴───────────┐             │  │  │
│  │  │              │         UserIntegration Table               │             │  │  │
│  │  │              │  (Jira/Asana/Trello tokens & config)       │             │  │  │
│  │  │              └────────────────────────────────────────────┘             │  │  │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                 │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Pinecone Vector Database                              │  │  │
│  │  │              (Meeting transcript embeddings for RAG)                    │  │  │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                 │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    AWS S3 Storage                                        │  │  │
│  │  │              (Meeting recordings, audio files, bot avatars)            │  │  │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                 │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    EXTERNAL SERVICES
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │    Google     │    │     Clerk    │    │   Resend     │    │   Ollama     │
    │    OAuth      │    │  (Auth SDK)  │    │   (Email)    │    │  (Local AI)  │
    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Core Classes & Components

### 1. User Management

```
┌─────────────────────────────────────────┐
│              <<entity>>                  │
│                User                     │
├─────────────────────────────────────────┤
│ - id: String                            │
│ - clerkId: String                       │
│ - email: String                         │
│ - name: String                          │
│ - botName: String                       │
│ - googleAccessToken: String             │
│ - googleRefreshToken: String            │
│ - gmailAccessToken: String              │
│ - slackUserId: String                   │
│ - slackConnected: Boolean               │
│ - calendarConnected: Boolean            │
└───────────────┬─────────────────────────┘
                │ 1..*
                │ contains
                ▼
┌─────────────────────────────────────────┐
│              <<entity>>                  │
│             Meeting                     │
├─────────────────────────────────────────┤
│ - id: String                            │
│ - title: String                         │
│ - startTime: DateTime                   │
│ - endTime: DateTime                     │
│ - transcript: Json                      │
│ - summary: String                       │
│ - actionItems: Json                     │
│ - botScheduled: Boolean                 │
│ - processed: Boolean                    │
└───────────────┬─────────────────────────┘
                │ 1..*
                │ contains
                ▼
┌─────────────────────────────────────────┐
│           <<entity>>                    │
│       TranscriptChunk                   │
├─────────────────────────────────────────┤
│ - id: String                            │
│ - chunkIndex: Int                       │
│ - content: String                       │
│ - speakerName: String                  │
│ - vectorId: String                      │
└─────────────────────────────────────────┘
```

### 2. AI & Chat System

```
┌────────────────────────────────────────────────────────────────────┐
│                        <<service>>                                  │
│                      RAGService                                    │
├────────────────────────────────────────────────────────────────────┤
│ + processTranscript(meetingId, transcript)                       │
│ + chatWithMeeting(userId, meetingId, question)                    │
│ + chatWithAllMeetings(userId, question)                           │
└────────────────────────────┬───────────────────────────────────────┘
                             │ uses
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                      <<service>>                                   │
│                    OllamaClient                                     │
├────────────────────────────────────────────────────────────────────┤
│ + generateEmbedding(text): number[]                               │
│ + chatWithAI(systemPrompt, userPrompt): string                    │
│ + checkModelAvailability(model): boolean                          │
└────────────────────────────┬───────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    <<external>>         │    │    <<external>>         │
│    Pinecone             │    │    Ollama Server        │
│  (Vector Database)     │    │   (Local LLM)           │
└─────────────────────────┘    └─────────────────────────┘
```

### 3. Integration Services

```
                    ┌──────────────────────────────────────┐
                    │        <<service>>                  │
                    │    IntegrationService                │
                    │       (Abstract)                    │
                    ├──────────────────────────────────────┤
                    │ + connect()                         │
                    │ + disconnect()                       │
                    │ + refreshToken()                     │
                    │ + sync()                             │
                    └──────────────┬───────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│<<service>>       │    │<<service>>       │    │<<service>>      │
│GoogleCalendar    │    │    SlackService  │    │    JiraService  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│+ fetchEvents()  │    │+ postMessage()  │    │+ createIssue()  │
│+ createEvent()  │    │+ postSummary()   │    │+ getIssues()    │
│+ syncCalendar() │    │+ sendDM()        │    │+ addComment()   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Google       │    │     Slack       │    │      Jira       │
│   Calendar API  │    │      API        │    │       API       │
└─────────────────┘    └─────────────────┘    └─────────────────┘

        ┌─────────────────┐    ┌─────────────────┐
        │<<service>>      │    │<<service>>      │
        │ AsanaService    │    │TrelloService    │
        ├─────────────────┤    ├─────────────────┤
        │+ createTask()   │    │+ createCard()   │
        │+ getTasks()     │    │+ getCards()     │
        │+ completeTask() │    │+ updateCard()   │
        └─────────────────┘    └─────────────────┘
```

### 4. Error Handling & Security

```
┌─────────────────────────────────────────────────────────────────┐
│                      <<interface>>                              │
│                      AppError                                   │
├─────────────────────────────────────────────────────────────────┤
│ + code: ErrorCode                                               │
│ + statusCode: number                                            │
│ + userMessage: string                                           │
│ + details: Record                                               │
│ + originalError: Error                                          │
└─────────────────────────────────────────────────────────────────┘
         ▲
         │ extends
         │
┌────────┴────────────────────────────────────────────────────────┐
│                     Error Categories                            │
├──────────────────────────────────────────────────────────────────┤
│  VALIDATION_ERRORS (VAL_*)    │  AUTH_ERRORS (AUTH_*)          │
│  MEETING_ERRORS (MEETING_*)  │  RAG_ERRORS (RAG_*)             │
│  INTEGRATION_ERRORS (INT_*)  │  RATE_LIMIT_ERRORS (LIMIT_*)    │
│  DATABASE_ERRORS (DB_*)       │  AI_ERRORS (AI_*)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   <<service>>                                   │
│                  SecurityService                                │
├─────────────────────────────────────────────────────────────────┤
│ + validateInput(schema, data)                                   │
│ + encodeHTML(str): string                                       │
│ + encodeJSON(obj): string                                       │
│ + sanitizeInput(str): string                                    │
│ + checkRateLimit(userId, limits)                                │
└─────────────────────────────────────────────────────────────────┘
```

### 5. API Routes Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           API Routes Hierarchy                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  /api                                                                          │
│  ├── /meetings                                                                  │
│  │    ├── GET    /                    → List all meetings                  │
│  │    ├── POST   /create               → Create new meeting                 │
│  │    ├── GET    /[id]                 → Get meeting details                │
│  │    ├── PUT    /[id]                 → Update meeting                     │
│  │    ├── DELETE /[id]                 → Delete meeting                     │
│  │    ├── GET    /[id]/transcript      → Get transcript                     │
│  │    ├── POST   /[id]/action-items    → Create action items                │
│  │    └── POST   /[id]/bot-toggle      → Toggle bot                         │
│  │                                                                             │
│  ├── /rag                                                                       │
│  │    ├── POST   /process              → Process transcript for RAG         │
│  │    ├── POST   /chat-meeting         → Chat with single meeting           │
│  │    └── POST   /chat-all             → Chat with all meetings             │
│  │                                                                             │
│  ├── /integrations                                                           │
│  │    ├── /gmail        (setup, callback, disconnect)                        │
│  │    ├── /slack        (install, oauth, events, post-meeting)              │
│  │    ├── /jira         (auth, setup, callback, disconnect)                  │
│  │    ├── /asana        (auth, setup, callback, disconnect)                 │
│  │    ├── /trello       (auth, setup, callback, disconnect)                  │
│  │    └── /status       → Get all integration statuses                      │
│  │                                                                             │
│  ├── /user                                                                   │
│  │    ├── /bot-settings    → Configure meeting bot                          │
│  │    ├── /calendar-status → Check Google Calendar status                   │
│  │    ├── /gmail-status    → Check Gmail connection status                 │
│  │    └── /refresh-calendar → Force calendar sync                           │
│  │                                                                             │
│  ├── /emails                                                                 │
│  │    ├── GET  /list          → List user emails                            │
│  │    └── POST /check         → Check email for action items                │
│  │                                                                             │
│  ├── /admin                                                                  │
│  │    ├── /create-sample-meetings                                            │
│  │    ├── /fix-action-items                                                  │
│  │    └── /fix-audio-urls                                                    │
│  │                                                                             │
│  └── /webhooks                                                               │
│       ├── /clerks          → Clerk auth webhooks                             │
│       └── /meetingbaas     → Meeting BaaS webhooks                          │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User Action
    │
    ▼
┌─────────────────┐
│   Next.js Page  │ ◄────── React Components
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│   API Route     │ ◄────── Middleware (Auth)
└────────┬────────┘
         │ Request
         ▼
┌─────────────────┐
│  Service Layer  │ ◄────── Validation
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│  AI   │ │  Data │
│Services│ │ Layer │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│Pinecone │ │Postgres │
└─────────┘ └─────────┘
```

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FRONTEND                    BACKEND                     DATABASE       │
│  ┌─────────────┐           ┌─────────────┐           ┌────────────┐  │
│  │  Next.js    │           │  Next.js     │           │ PostgreSQL │  │
│  │  React 18   │           │  API Routes  │           │  (Prisma)  │  │
│  │  TypeScript │           │  Node.js     │           └────────────┘  │
│  │  Tailwind   │           └─────────────┘               │            │
│  │  shadcn/ui  │                   │                     │            │
│  └─────────────┘                   ▼                     ▼            │
│                         ┌─────────────────┐     ┌─────────────────┐   │
│  AUTH                   │   Ollama        │     │   Pinecone      │   │
│  ┌─────────────┐       │   (Local LLM)   │     │   (Vectors)     │   │
│  │   Clerk     │       └─────────────────┘     └─────────────────┘   │
│  └─────────────┘                                                     │
│                                                               AWS        │
│  INTEGRATIONS                      MONITORING              ┌─────────┐  │
│  ┌─────────────┐                   ┌─────────────┐        │   S3    │  │
│  │  Google     │                   │  Custom     │        │(Storage)│  │
│  │  Slack      │                   │  Logger     │        └─────────┘  │
│  │  Jira       │                   └─────────────┘                    │
│  │  Asana      │                                                      │
│  │  Trello     │                                                      │
│  │  Resend     │                                                      │
│  └─────────────┘                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

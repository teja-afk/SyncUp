# SyncUp Application - High-Level Sequence Diagram

## Complete System Flow Overview

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          SYNCUP APPLICATION                                                │
│                                         High-Level Sequence Diagram                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────┐   ┌───────────┐   ┌──────────┐   ┌───────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│  Client  │   │  Middle-  │   │   API    │   │ Service   │   │  External │   │Database/ │   │External  │
│(Browser/ │   │   ware    │   │  Routes  │   │   Layer   │   │   APIs    │   │ VectorDB │   │ Services │
│  Mobile) │   │ (Clerk)   │   │          │   │           │   │           │   │(Prisma/  │   │(Google/  │
│          │   │           │   │          │   │           │   │           │   │ Pinecone)│   │ Slack/   │
│          │   │           │   │          │   │           │   │           │   │          │   │ Ollama)  │
└────┬─────┘   └─────┬─────┘   └────┬─────┘   └─────┬─────┘   └─────┬─────┘   └────┬─────┘   └────┬─────┘
     │               │               │               │               │               │               │
     │ 1. USER AUTHENTICATION FLOW                                                                              │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Request      │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │  Validate     │               │               │               │               │
     │               │  Session      │               │               │               │               │
     │               │──────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Verify JWT  │               │               │               │
     │               │               │─────────────>│               │               │               │
     │               │               │               │               │               │               │
     │               │               │               │               │   ┌───────────┤               │
     │               │               │               │               │   │  Clerk    │               │
     │               │               │               │──────────────>│   │  Auth    │               │
     │               │               │               │               │   │  Verify  │               │
     │               │               │               │               │   │<─────────│               │
     │               │               │               │               │               │               │
     │               │               │  Auth OK    │               │               │               │
     │               │<──────────────────────────────────────────────│               │               │
     │               │               │               │               │               │               │
     │  Authenticated│               │               │               │               │               │
     │<──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │ 2. MEETING CREATION FLOW                                                                                │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Create       │               │               │               │               │               │
     │  Meeting      │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │ POST /meetings│               │               │               │               │
     │               │──────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Validate    │               │               │               │
     │               │               │  Request     │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │  Validated   │               │               │               │
     │               │               │<─────────────│               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Create      │               │               │               │
     │               │               │  Meeting     │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │               │  ┌───────────┤               │
     │               │               │               │               │  │  Prisma  │               │
     │               │               │               │──────────────>│  │  (DB)   │               │
     │               │               │               │               │  │<─────────│               │
     │               │               │               │               │               │               │
     │               │               │  Meeting     │               │               │               │
     │               │               │  Created     │<──────────────│               │               │
     │               │               │               │               │               │               │
     │               │               │  (Optional)  │               │               │               │
     │               │               │  Sync to      │               │               │               │
     │               │               │  Google Cal   │──────────────>│               │               │
     │               │               │               │               │               │   ┌─────────│
     │               │               │               │               │               │   │ Google  │
     │               │               │               │──────────────>│               │   │ Calendar│
     │               │               │               │               │               │   │ API    │
     │               │               │               │               │               │   │<───────│
     │               │               │               │               │               │               │
     │  Success      │               │               │               │               │               │
     │<──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │ 3. MEETING TRANSCRIPT PROCESSING (RAG)                                                                   │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │ Meeting       │               │               │               │               │               │
     │ Transcript    │               │               │               │               │               │
     │ Webhook      │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │ POST         │               │               │               │               │
     │               │ /webhooks/   │               │               │               │               │
     │               │ meetingbaas  │               │               │               │               │
     │               │─────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │ Process      │               │               │               │
     │               │               │ Transcript    │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │  Chunk        │               │               │
     │               │               │               │  Transcript   │──────────────>│               │
     │               │               │               │               │               │               │
     │               │               │               │  Generate    │               │               │
     │               │               │               │  Embeddings   │──────────────>│               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Ollama │
     │               │               │               │               │──────────────>│    │Embed  │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │               │  Store        │               │               │
     │               │               │               │  Vectors      │──────────────>│               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Pinecone
     │               │               │               │──────────────>│               │    │Store  │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │               │  Save DB     │               │               │
     │               │               │               │  Chunks       │──────────────>│               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Prisma │
     │               │               │               │               │──────────────>│    │DB     │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │  200 OK      │               │               │               │               │               │
     │<─────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │ 4. CHAT WITH MEETING (RAG QUERY)                                                                        │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Ask          │               │               │               │               │               │
     │  Question     │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │ POST /rag/    │               │               │               │               │
     │               │ chat-meeting │               │               │               │               │
     │               │─────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Check       │               │               │               │
     │               │               │  Cache       │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │  Cache Hit?  │<──────────────│               │
     │               │               │               │               │               │               │
     │               │               │  Generate    │               │               │               │
     │               │               │  Embedding   │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │  Embedding   │<──────────────│               │
     │               │               │               │               │               │               │
     │               │               │  Search      │               │               │               │
     │               │               │  Vectors     │──────────────>│               │               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Pinecone│
     │               │               │               │──────────────>│               │    │Search │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │  Build       │               │               │               │
     │               │               │  Context     │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │  Generate    │               │               │               │
     │               │               │  Answer      │──────────────>│               │               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Ollama │
     │               │               │               │               │──────────────>│    │Chat   │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │  Cache       │               │               │               │
     │               │               │  Answer      │──────────────>│               │               │
     │               │               │               │               │               │               │
     │  Answer      │               │               │               │               │               │
     │<─────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │ 5. EMAIL SUMMARIZATION FLOW                                                                          │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Sync         │               │               │               │               │               │
     │  Emails       │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │ GET /emails/ │               │               │               │               │
     │               │ list          │               │               │               │               │
     │               │─────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Fetch       │               │               │               │
     │               │               │  Emails      │──────────────>│               │               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │ Gmail │
     │               │               │               │               │──────────────>│    │API    │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │  For each   │               │               │               │
     │               │               │  email:      │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │  Generate    │               │               │
     │               │               │               │  Summary     │──────────────>│               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Ollama │
     │               │               │               │               │──────────────>│    │LLM    │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │  Save to     │               │               │               │
     │               │               │  Database    │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │  Send        │               │               │               │
     │               │               │  Summary     │──────────────>│               │               │
     │               │               │  Email       │               │               │               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │Resend │
     │               │               │               │               │──────────────>│    │Email  │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │ 6. SLACK INTEGRATION FLOW                                                                            │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Install      │               │               │               │               │               │
     │  Slack App   │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │ OAuth         │               │               │               │               │
     │               │ Redirect      │               │               │               │               │
     │               │──────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │  Authorize   │               │               │               │               │               │
     │────────────────────────────────────────────────────────────────────────────────>│
     │               │               │               │               │               │               │
     │               │               │  Auth Code  │               │               │               │
     │               │<────────────────────────────────────────────────────────────────│
     │               │               │               │               │               │               │
     │               │ POST          │               │               │               │               │
     │               │ /callback     │               │               │               │               │
     │               │─────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Exchange   │               │               │               │
     │               │               │  Token       │──────────────>│               │               │
     │               │               │               │               │               │    ┌───────│
     │               │               │               │               │               │    │ Slack │
     │               │               │               │               │──────────────>│    │OAuth  │
     │               │               │               │               │               │    │<──────│
     │               │               │               │               │               │               │
     │               │               │  Save        │               │               │               │
     │               │               │  Installation│─────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │               │  ┌───────────┤               │
     │               │               │               │               │  │  Prisma  │               │
     │               │               │               │               │  │<─────────│               │
     │               │               │               │               │               │               │
     │ 7. MEETING BOT REAL-TIME TRANSCRIPTION                                                               │
     │               │               │               │               │               │               │
     │ ──────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Meeting     │               │               │               │               │               │
     │  Started     │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Bot         │               │               │               │               │               │
     │  Joins       │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │  Audio       │               │               │               │               │               │
     │  Stream      │               │               │               │               │               │
     │──────────────>│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │  Real-time   │               │               │               │               │
     │               │  Transcription│              │               │               │               │
     │               │──────────────>│               │               │               │               │
     │               │               │               │               │               │               │
     │               │               │  Process    │               │               │               │
     │               │               │  Audio       │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │  Transcript │<──────────────│               │
     │               │               │               │               │               │               │
     │               │               │  Save        │               │               │               │
     │               │               │  Transcript   │──────────────>│               │               │
     │               │               │               │               │               │               │
     │               │               │               │               │  ┌───────────┤               │
     │               │               │               │               │  │  Prisma  │               │
     │               │               │               │               │  │<─────────│               │
     │               │               │               │               │               │               │
     │  Meeting     │               │               │               │               │               │
     │  Ended       │               │               │               │               │               │
     │<─────────────│               │               │               │               │               │
     │               │               │               │               │               │               │
     │               │  Generate    │               │               │               │               │
     │               │  Summary     │──────────────>│               │               │               │
     │               │               │               │               │               │               │
     │               │               │               │  AI          │               │               │
     │               │               │               │  Summary     │──────────────>│               │
     │               │               │               │               │               │               │
     │               │               │               │  Extract     │               │               │
     │               │               │               │  Action      │──────────────>│               │
     │               │               │               │  Items       │               │               │
     │               │               │               │               │               │               │
     │               │               │  Save        │               │               │
     │               │               │  Meeting     │──────────────>│               │
     │               │               │  Data        │               │               │
     │               │               │               │               │               │
     │               │               │  Send        │               │               │
     │               │               │  Summary     │──────────────>│               │
     │               │               │  Email       │               │               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ 8. EXTERNAL INTEGRATIONS (Jira/Asana/Trello)                                                        │
     │               │               │               │               │               │
     │ ──────────────│               │               │               │               │
     │               │               │               │               │               │
     │  Connect     │               │               │               │               │
     │  Service     │               │               │               │               │
     │──────────────>│               │               │               │               │
     │               │               │               │               │               │
     │               │ GET          │               │               │               │
     │               │ /integrations/               │               │               │
     │               │ {provider}   │               │               │               │
     │               │ /setup       │               │               │               │
     │               │─────────────>│               │               │               │
     │               │               │               │               │               │
     │               │  Redirect   │               │               │               │
     │               │  to OAuth    │──────────────>│               │               │
     │               │               │               │               │               │
     │  Authorize   │               │               │               │               │
     │────────────────────────────────────────────────────────────────────────────────>│
     │               │               │               │               │               │
     │               │  Auth Code  │               │               │               │
     │               │<────────────────────────────────────────────────────────────────│
     │               │               │               │               │               │
     │               │ POST         │               │               │               │
     │               │ /callback    │               │               │               │
     │               │─────────────>│               │               │               │
     │               │               │               │               │               │
     │               │               │  Exchange   │               │               │
     │               │               │  Token       │──────────────>│               │
     │               │               │               │               │               │
     │               │               │  Save        │               │               │
     │               │               │  Integration │──────────────>│               │
     │               │               │               │               │               │
     │               │               │               │               │               │
     │ 9. ERROR HANDLING FLOW                                                                                │
     │               │               │               │               │               │
     │ ──────────────│               │               │               │               │
     │               │               │               │               │               │
     │  API Call    │               │               │               │               │
     │──────────────>│               │               │               │               │
     │               │               │               │               │               │
     │               │ Process      │               │               │               │
     │               │ Request      │──────────────>│               │               │
     │               │               │               │               │               │
     │               │               │  Business   │               │               │
     │               │               │  Logic       │──────────────>│               │
     │               │               │               │               │               │
     │               │               │  Validation │               │               │
     │               │               │  Error       │<──────────────│               │
     │               │               │               │               │               │
     │               │  Create      │               │               │               │
     │               │  AppError    │──────────────>│               │               │
     │               │               │               │               │               │
     │               │  Log Error  │               │               │               │
     │               │               │<─────────────│               │               │
     │               │               │               │               │               │
     │               │  Error      │               │               │               │
     │               │  Response    │<──────────────│               │               │
     │               │               │               │               │               │
     │  Error       │               │               │               │               │
     │  Display     │               │               │               │               │
     │<─────────────│               │               │               │               │
     │               │               │               │               │               │
     └───────────────┴───────────────┴───────────────┴───────────────┴───────────────┴───────────────┘


==============================================================================================================
                                      LEGEND / COMPONENT DESCRIPTIONS
==============================================================================================================

CLIENT LAYER:
  - Browser/Mobile: End-user interface (Next.js React frontend)
  - UI Components: Chat interface, Dashboard, Meeting views

MIDDLEWARE:
  - Clerk Auth: Authentication and session management
  - JWT Verification: Request authorization
  - Rate Limiting: Request throttling

API ROUTES:
  - /meetings/*       - Meeting CRUD operations
  - /rag/*           - RAG chat operations
  - /integrations/*   - Third-party integrations (Slack, Jira, etc.)
  - /emails/*        - Email fetching and summarization
  - /webhooks/*      - External webhook handlers

SERVICE LAYER:
  - RAGService       - Retrieval-augmented generation
  - MeetingService   - Meeting management
  - EmailProcessor   - Email summarization
  - SlackService     - Slack messaging
  - IntegrationService - Third-party integrations
  - CacheManager     - Caching layer

EXTERNAL APIs:
  - Google Calendar  - Calendar synchronization
  - Gmail API        - Email access
  - Slack API        - Messaging
  - Jira API         - Project management
  - Asana API        - Task management
  - Trello API       - Board management
  - Resend           - Email delivery
  - Ollama           - Local AI/LLM

DATABASE/STOREDB:
  - Prisma (PostgreSQL) - User, Meeting, Email data
  - Pinecone           - Vector embeddings for RAG
  - AWS S3            - File storage (recordings, avatars)

==============================================================================================================
                                    KEY BUSINESS FLOWS SUMMARY
==============================================================================================================

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 1: USER AUTHENTICATION                                                                            │
│  User → Client → Middleware → Clerk Auth → Database → User Session                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 2: MEETING CREATION                                                                                │
│  User → Client → API (/meetings) → Validation → Database → Google Calendar (optional) → Response       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 3: TRANSCRIPT PROCESSING (RAG)                                                                   │
│  Webhook → API → RAG Service → Ollama (embed) → Pinecone (store) → Database → Response                  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 4: RAG CHAT QUERY                                                                                 │
│  User Question → API → RAG (cache check) → Ollama (embed) → Pinecone (search) → Ollama (answer) → User │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 5: EMAIL SUMMARIZATION                                                                             │
│  Sync Request → API → Gmail API → For Each: Ollama (summarize) → Database → Resend (email) → User       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 6: SLACK INTEGRATION                                                                              │
│  Install App → OAuth → Slack OAuth API → Database → Meeting Summary → Slack API → Channel                │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 7: MEETING BOT TRANSCRIPTION                                                                       │
│  Meeting Platform → Bot Joins → Real-time Audio → Transcription → Meeting Ended → AI Summary → Email    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 8: THIRD-PARTY INTEGRATIONS                                                                        │
│  Connect Request → OAuth Redirect → User Authorizes → OAuth Token Exchange → Database → Complete        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FLOW 9: ERROR HANDLING                                                                                  │
│  Any Request → Processing → Error Occurs → Create AppError → Log → Return Error Response → User Display │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

==============================================================================================================

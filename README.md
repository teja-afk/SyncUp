# 🤖 Meeting Bot - AI-Powered Meeting Assistant

**Meeting Bot** is an intelligent meeting assistant that automatically joins your meetings, records audio, generates transcripts, creates summaries, extracts action items, and enables AI-powered chat with your meeting history using RAG (Retrieval Augmented Generation).

Built with **Next.js**, **Prisma**, **Ollama** (local AI), and **Pinecone** (vector search), Meeting Bot provides a complete meeting management solution with local AI processing for privacy and cost-effectiveness.

---

## 🚀 Features

- 🎙️ **Automatic Audio Recording** – Records meetings via MeetingBaaS integration
- 📝 **Real-time Transcription** – Converts speech to text automatically
- 🤖 **AI-Powered Summaries** – Generates concise meeting summaries
- ✅ **Action Item Extraction** – Identifies tasks, decisions, and follow-ups
- 💬 **Intelligent Chat** – Ask questions about any meeting with RAG
- 🔍 **Cross-Meeting Search** – Search across all your meeting history
- 📧 **Email Notifications** – Receive summaries and action items via email
- 🎵 **Audio Playback** – Review recordings with custom audio player
- 🔗 **Calendar Integration** – Sync with Google Calendar
- 🏷️ **Smart Tagging** – Automatic categorization and speaker detection

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **AI Engine:** Ollama (Local AI) - Mistral, Llama2, Nomic Embed Text
- **Vector Search:** Pinecone (768-dimension vectors)
- **Authentication:** Clerk
- **Email Service:** Resend
- **Cloud Storage:** AWS S3
- **Integrations:** Google Calendar, Slack, Jira, Asana, Trello

---

## 📋 Prerequisites

- **Node.js >= 18** - [Download here](https://nodejs.org/)
- **Ollama** - Local AI runtime [Install here](https://ollama.ai/)
- **PostgreSQL Database** - (Handled by Neon, no local setup needed)
- **Git** - For cloning the repository

---

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/teja-afk/meeting-bot.git
cd meeting-bot
npm install
```

### 2. Set Up Ollama (Local AI)

**Install Ollama:**
```bash
# On Windows, download from https://ollama.ai/download
# On Mac/Linux, use the installer
```

**Pull Required Models:**
```bash
ollama pull mistral        # Main chat model (4.4GB)
ollama pull llama2         # Fallback chat model (3.8GB)
ollama pull nomic-embed-text  # Embedding model for search (274MB)
```

**Start Ollama Service:**
```bash
ollama serve  # Runs in background
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:your_password@your_host/neondb?sslmode=require

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Calendar Integration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Vector Search (Pinecone)
PINECONE_API_KEY=pcsk_your_pinecone_key
PINECONE_INDEX_NAME=meeting-bot-768

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_key

# Cloud Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET_NAME=your_s3_bucket

# Meeting Recording (MeetingBaaS)
MEETING_BAAS_API_KEY=your_baas_key
WEBHOOK_URL=https://your-domain.ngrok-free.app/api/webhooks/meetingbaas

# Optional Integrations
SLACK_CLIENT_ID=your_slack_id
SLACK_CLIENT_SECRET=your_slack_secret
JIRA_CLIENT_ID=your_jira_id
ASANA_CLIENT_ID=your_asana_id
TRELLO_API_KEY=your_trello_key
```

### 4. Set Up Database

```bash
# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: View database in browser
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing and Sample Data

### Create Sample Meeting Data

```bash
# Seed sample meeting with transcript
npx tsx scripts/seed-sample-meeting.ts

# Process for AI search (RAG)
npx tsx scripts/process-sample-for-rag.ts

# Test Pinecone connection
npx tsx scripts/test-pinecone-connection.ts
```

### Test Chat Functionality

1. **Go to:** http://localhost:3000/chat
2. **Ask questions like:**
   - "What was discussed in the Q4 planning meeting?"
   - "What are the action items from recent meetings?"
   - "Who is responsible for the analytics dashboard?"

---

## 📁 Project Structure

```
/app                    # Next.js pages and API routes
  /api                  # API endpoints
    /rag              # RAG (search) functionality
    /webhooks         # MeetingBaaS webhooks
    /integrations     # Third-party integrations
  /chat               # Chat interface
  /home               # Dashboard
  /meeting/[id]       # Individual meeting pages

/lib                    # Core utilities
  /ai-processor.ts     # AI processing logic
  /rag.ts             # RAG implementation
  /pinecone.ts        # Vector search
  /openai.ts          # Ollama integration

/scripts               # Setup and utility scripts
  /setup-ollama.ts    # Ollama configuration
  /pull-chat-models.ts # Model installation
  /seed-sample-meeting.ts # Sample data

/prisma               # Database schema
  /schema.prisma     # Database models

/public              # Static assets
  /test-audio.mp3   # Sample audio file
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open database browser
npx prisma db push      # Update database schema
npx prisma generate     # Regenerate Prisma client

# AI Setup
npx tsx scripts/setup-ollama.ts      # Configure Ollama
npx tsx scripts/pull-chat-models.ts  # Install AI models

# Testing
npx tsx scripts/seed-sample-meeting.ts    # Create sample data
npx tsx scripts/process-sample-for-rag.ts # Process for search
npx tsx scripts/test-pinecone-connection.ts # Test vector search
```

---

## 🌟 Key Features Explained

### 🎙️ Audio Recording
- **Automatic recording** via MeetingBaaS
- **S3 storage** for reliable access
- **Custom audio player** with controls

### 🤖 AI Processing
- **Local AI** via Ollama (no API costs)
- **Multiple models**: Mistral, Llama2, Nomic Embed Text
- **768-dimension vectors** for accurate search

### 💬 RAG Chat System
- **Contextual responses** based on meeting content
- **Cross-meeting search** across all your history
- **Speaker attribution** and decision tracking

### 📧 Email Integration
- **Automatic summaries** sent after meetings
- **Action item notifications**
- **Customizable email templates**

---

## 🔐 Authentication Setup

1. **Sign up at [Clerk](https://clerk.com/)**
2. **Create a new application**
3. **Configure Google OAuth** for calendar integration
4. **Copy credentials** to your `.env` file

## ☁️ Cloud Services Setup

### Pinecone (Vector Search)
1. **Create account** at [pinecone.io](https://pinecone.io/)
2. **Create index** named `meeting-bot-768` with:
   - **Dimensions**: 768
   - **Metric**: Cosine
   - **Pod Type**: p1.x1

### AWS S3 (File Storage)
1. **Create S3 bucket** for audio storage
2. **Configure CORS** for web access
3. **Set up IAM user** with S3 permissions

### Resend (Email Service)
1. **Sign up** at [resend.com](https://resend.com/)
2. **Get API key** from dashboard
3. **Verify your domain** for better deliverability

---

## 🚀 Production Deployment

### Environment Variables for Production

```env
# Update these for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
WEBHOOK_URL=https://your-domain.com/api/webhooks/meetingbaas
```

### Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Vercel, Netlify, or your preferred platform
# Make sure to set environment variables in your deployment platform
```

---

## 🐛 Troubleshooting

### Common Issues

**Ollama not connecting:**
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
ollama serve
```

**Pinecone dimension mismatch:**
```bash
# Create new index with correct dimensions
# Go to Pinecone dashboard → Create Index
# Dimensions: 768, Metric: cosine
```

**Database connection issues:**
```bash
# Reset database
npx prisma db push --force-reset
```

**Chat not responding:**
```bash
# Check if vectors are in Pinecone
npx tsx scripts/debug-chat-response.ts

# Reprocess meeting data
npx tsx scripts/process-sample-for-rag.ts
```

---

## 📚 API Endpoints

| Endpoint                    | Method | Description                 |
|-----------------------------|--------|-----------------------------|
| `/api/rag/chat-all`         | POST   | Chat across all meetings    |
| `/api/rag/chat-meeting`     | POST   | Chat about specific meeting |
| `/api/webhooks/meetingbaas` | POST   | Meeting completion webhook  |
| `/api/meetings`             | GET    | List user meetings          |
| `/api/user/usage`           | GET    | User usage statistics       |

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

### Development Guidelines

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **comprehensive tests**
- Update **documentation** for new features

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Ollama** for local AI processing
- **Pinecone** for vector search capabilities
- **MeetingBaaS** for audio recording services
- **Clerk** for authentication
- **Resend** for email delivery

---

## 📞 Support

For support and questions:
- 📧 **Email**: tejapoosa123@gmail.com
- 💬 **Issues**: [GitHub Issues](https://github.com/teja-afk/meeting-bot/issues)
- 📖 **Documentation**: This README

---

**Happy Meeting Management! 🎉**

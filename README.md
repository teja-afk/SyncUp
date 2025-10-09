# SyncUp

**SyncUp** is an AI-powered meeting summarizer that helps teams stay on the same page by turning long meeting discussions into clear, concise, and actionable summaries. Built with **Next.js**, **Prisma**, and modern AI models, SyncUp simplifies collaboration by automatically extracting key points, decisions, and tasks from meeting transcripts.

---

## 🚀 Features

- 📝 **AI Summarization** – Generates concise summaries of meetings.
- 🎯 **Action Item Extraction** – Highlights key tasks and decisions.
- 📂 **Organized History** – Store and manage meeting transcripts.
- ⚡ **Modern Stack** – Built using Next.js, Prisma, and scalable technologies.
- 🌐 **Productivity Tool** – Helps teams save time and stay aligned.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React
- **Backend:** Node.js, Prisma
- **Database:** PostgreSQL
- **AI:** NLP / Summarization models
- **Languages:** TypeScript, JavaScript

---

## 📁 Project Structure

/app # Next.js pages and components
/lib # Utilities and AI helpers
/prisma # Database schema & migrations
/public # Static assets

---

## ⚡ Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database
- npm

### Installation
```bash
git clone https://github.com/teja-afk/SyncUp.git
cd SyncUp
yarn install  # or npm install
```

Environment Variables

Create a .env file and add your configuration:

```
DATABASE_URL=your_postgres_url
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
PINECONE_API_KEY=your_pinecone_api_key
RESEND_API_KEY=your_resend_api_key
```
Run the App
```
npm run dev
```
Open http://localhost:3000 in your browser.

---
🎯 Usage

Upload your meeting transcript (text or audio converted to text).

1. Click Summarize to generate concise meeting notes.

2. View extracted action items, decisions, and highlights.

3. Save or export summaries for future reference.

---

📚 Topics

ai nlp meeting-summarizer text-summarization productivity-tool nextjs prisma react nodejs collaboration workflow-automation

---

🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for bug fixes, feature requests, or improvements.

---

📄 License

MIT License

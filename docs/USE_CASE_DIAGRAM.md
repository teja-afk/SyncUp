# SyncUp Fork - Use Case Diagram

## Overview
This document describes the use cases for SyncUp Fork (Meeting Bot), an AI-powered meeting assistant that automatically joins meetings, records audio, generates transcripts, creates summaries, extracts action items, and enables AI-powered chat with meeting history.

## Actors

| Actor | Description |
|-------|-------------|
| **User** | Main actor - uses the application for meeting management |
| **Admin** | Administrative user with elevated privileges |
| **Google Calendar** | External system for calendar integration |
| **MeetingBaaS** | External service for meeting recording |
| **Slack** | External system for team communication |
| **Jira** | External system for project tracking |
| **Asana** | External system for task management |
| **Trello** | External system for project management |
| **Gmail** | External system for email integration |

## Use Cases

### 1. Authentication & Profile
- **UC1: Sign In** - User authenticates to the system
- **UC2: Sign Up** - New user creates an account
- **UC3: Manage Profile** - User updates their profile settings

### 2. Meeting Management
- **UC4: Create Meeting** - User creates a new meeting
- **UC5: View Meetings** - User views list of all meetings
- **UC6: View Past Meetings** - User views past meetings
- **UC7: View Upcoming Meetings** - User views upcoming meetings
- **UC8: Delete Meeting** - User deletes a meeting
- **UC9: Toggle Bot** - User enables/disables meeting bot
- **UC10: View Meeting Details** - User views detailed meeting information
- **UC11: View Transcript** - User views meeting transcript
- **UC12: View Action Items** - User views extracted action items
- **UC13: Manage Action Items** - User manages action items (edit, complete, delete)

### 3. Calendar Integration
- **UC14: Sync Calendar** - Synchronize with Google Calendar
- **UC15: Check Calendar Status** - Check calendar connection status
- **UC16: Refresh Calendar** - Manually refresh calendar data

### 4. Meeting Recording (MeetingBaaS)
- **UC17: Record Meeting** - Automatically record meeting audio
- **UC18: Receive Webhook** - Receive meeting completion webhook
- **UC19: Process Audio** - Process recorded audio for transcription

### 5. AI Processing
- **UC20: Generate Summary** - Generate AI-powered meeting summary
- **UC21: Generate Final Summary** - Generate final summary after meeting
- **UC22: Extract Action Items** - Extract action items from meeting
- **UC23: Process for RAG** - Process meeting data for vector storage

### 6. RAG Chat System
- **UC24: Chat with AI (All Meetings)** - Ask questions across all meetings
- **UC25: Chat with AI (Specific Meeting)** - Ask questions about a specific meeting
- **UC26: Search Meetings** - Search through meeting history

### 7. Email Notifications
- **UC27: Send Email** - Send meeting summary via email
- **UC28: Check Emails** - Check for new emails
- **UC29: List Emails** - List user emails

### 8. User Settings
- **UC30: Configure Bot Settings** - Configure bot behavior
- **UC31: Upload Bot Avatar** - Upload custom bot avatar
- **UC32: View Usage Statistics** - View user usage statistics

### 9. Slack Integration
- **UC33: Setup Slack Integration** - Connect Slack workspace
- **UC34: Post to Slack** - Post meeting summaries to Slack
- **UC35: Receive Slack Events** - Receive events from Slack
- **UC36: Disconnect Slack** - Disconnect Slack integration

### 10. Jira Integration
- **UC37: Setup Jira Integration** - Connect Jira account
- **UC38: Authenticate Jira** - Authenticate with Jira
- **UC39: Create Jira Tasks** - Create tasks in Jira from action items
- **UC40: Disconnect Jira** - Disconnect Jira integration

### 11. Asana Integration
- **UC41: Setup Asana Integration** - Connect Asana account
- **UC42: Authenticate Asana** - Authenticate with Asana
- **UC43: Create Asana Tasks** - Create tasks in Asana from action items
- **UC44: Disconnect Asana** - Disconnect Asana integration

### 12. Trello Integration
- **UC45: Setup Trello Integration** - Connect Trello account
- **UC46: Authenticate Trello** - Authenticate with Trello
- **UC47: Create Trello Cards** - Create cards in Trello from action items
- **UC48: Disconnect Trello** - Disconnect Trello integration

### 13. Gmail Integration
- **UC49: Setup Gmail Integration** - Connect Gmail account
- **UC50: Check Gmail Status** - Check Gmail connection status
- **UC51: Disconnect Gmail** - Disconnect Gmail integration

### 14. Google Calendar Integration
- **UC52: Setup Google Calendar** - Connect Google Calendar
- **UC53: Disconnect Google Calendar** - Disconnect Google Calendar

### 15. Integration Management
- **UC57: View Integration Status** - View status of all integrations

### 16. Admin Functions
- **UC54: Create Sample Meetings** - Create sample meeting data
- **UC55: Fix Action Items** - Fix incorrect action items
- **UC56: Fix Audio URLs** - Fix broken audio URLs

## Use Case Relationships

### Include Relationships
- UC17 (Record Meeting) **includes** UC18 (Receive Webhook)
- UC18 **includes** UC19 (Process Audio)
- UC19 **includes** UC20 (Generate Summary)
- UC20 **includes** UC21 (Generate Final Summary)
- UC20 **includes** UC22 (Extract Action Items)
- UC22 **includes** UC23 (Process for RAG)
- UC27 (Send Email) **includes** UC12 (View Action Items)
- UC34 (Post to Slack) **includes** UC12 (View Action Items)
- UC39 (Create Jira Tasks) **includes** UC12 (View Action Items)
- UC43 (Create Asana Tasks) **includes** UC12 (View Action Items)
- UC47 (Create Trello Cards) **includes** UC12 (View Action Items)

## PlantUML Diagram

A PlantUML representation of this use case diagram is available in:
- [`use-case-diagram.puml`](use-case-diagram.puml)

To view the diagram, you can use:
- Online PlantUML viewer at https://www.plantuml.com/plantuml/
- VS Code PlantUML extension
- Any PlantUML-compatible tool

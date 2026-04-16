# AI Chatbot Feature

## Overview
The AI Advisor chatbot uses Claude 3.5 Sonnet to provide personalized education guidance to students.

## Features
- **Personalized Advice**: Uses student profile data (major, GPA, budget, location, career goals) for context-aware responses
- **Real-time Chat**: Interactive chat interface with message history
- **Smart Suggestions**: Pre-built question prompts for common queries
- **Modern UI**: Beautiful, responsive design matching the Rivernova aesthetic

## How It Works

### API Endpoint
- **Route**: `/api/chat`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "What schools match my profile?" }
    ],
    "userProfile": {
      "academic_background": { "major": "Computer Science", "gpa": "3.8" },
      "budget": { "min": 20000, "max": 50000 },
      "location_preferences": { "preferredCountries": "USA, Canada" },
      "career_goals": { "dreamJob": "Software Engineer" }
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Based on your profile...",
    "usage": { "input_tokens": 150, "output_tokens": 200 }
  }
  ```

### User Interface
- **Location**: `/dashboard/ai`
- **Components**:
  - Chat message display with user/assistant avatars
  - Text input with keyboard shortcuts (Enter to send, Shift+Enter for new line)
  - Suggested questions for quick access
  - Loading states and error handling

## Usage

### Accessing the Chatbot
1. Navigate to the dashboard
2. Click "AI Advisor" in the sidebar
3. Start chatting!

### Example Questions
- "What schools match my profile?"
- "How can I improve my application?"
- "Tell me about scholarship opportunities"
- "What are my career prospects?"

## Configuration

### Environment Variables
Make sure your `.env.local` includes:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Model Settings
- **Model**: claude-3-5-sonnet-20241022
- **Max Tokens**: 2048
- **Temperature**: Default (1.0)

## Technical Details

### Dependencies
- `@anthropic-ai/sdk`: Official Anthropic SDK for Claude API
- `lucide-react`: Icons
- `@supabase/supabase-js`: User profile data

### File Structure
```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint
│   └── dashboard/
│       └── ai/
│           └── page.tsx           # Chat UI
```

## Future Enhancements
- [ ] Save chat history to database
- [ ] Export chat transcripts
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Integration with school search results
- [ ] Document upload for application review

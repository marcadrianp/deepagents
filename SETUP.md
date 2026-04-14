# Deep Agents Web Application - Setup Guide

This is a hybrid web application that combines:
- **Frontend**: Next.js 16 with React, Tailwind CSS, and AI SDK 6
- **Backend**: Python FastAPI with Deep Agents SDK

## Architecture

```
┌─────────────────────────────────────────┐
│   Next.js Frontend (React + AI SDK)     │
│   - Chat Interface (floating islands)   │
│   - Streaming messages & artifacts      │
│   - Real-time UI updates                │
└────────────────────┬────────────────────┘
                     │ HTTP/SSE
                     ↓
┌─────────────────────────────────────────┐
│  FastAPI Backend (Python + DeepAgents)  │
│  - LangGraph Agent with tool calling    │
│  - File operations, shell execution     │
│  - Memory & subagent middleware         │
└─────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.10+ (for Deep Agents backend)
- Anthropic API key (for Claude models)

## Installation

### 1. Frontend Setup

```bash
# Install Node dependencies
npm install

# Copy environment file and update with your API key
cp .env.example .env.local
# Edit .env.local and set DEEP_AGENT_BACKEND_URL if needed
```

### 2. Backend Setup

```bash
cd backend

# Run the setup script (Linux/macOS)
bash setup.sh

# OR manually on Windows:
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install -e ../libs/deepagents
```

## Running the Application

### 1. Start the Python Backend

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# OR
venv\Scripts\activate     # Windows

# Set your Anthropic API key
export ANTHROPIC_API_KEY='sk-ant-...'  # Linux/macOS
# OR
set ANTHROPIC_API_KEY=sk-ant-...       # Windows

# Run the server (listens on http://localhost:8000)
python app.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 2. Start the Next.js Frontend (in another terminal)

```bash
# Install dependencies if not done yet
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

**Frontend (.env.local):**
```
DEEP_AGENT_BACKEND_URL=http://localhost:8000
```

**Backend (shell environment):**
```
ANTHROPIC_API_KEY=sk-ant-...
LANGCHAIN_TRACING_V2=false  # Optional: enable LangChain tracing
LANGCHAIN_API_KEY=...        # Optional: LangChain API key for tracing
```

## Features

### Chat Interface
- Real-time streaming responses from Deep Agents
- Floating island UI with glassmorphic design
- Dark/light mode support
- Responsive layout with collapsible sidebar

### Deep Agents Capabilities
The Python backend provides access to:
- **File Operations**: read_file, write_file, edit_file, ls, grep
- **Shell Execution**: execute (sandboxed)
- **Planning**: write_todos, update_todo
- **Subagents**: task delegation to specialized agents

### UI Components
- **Sidebar**: Navigation with module switcher
- **Main Workarea**: Chat interface with streaming messages
- **Middle Column**: Dynamic panel for skills/notes
- **Right Canvas**: Code artifact viewer with syntax highlighting
- **Todo Panel**: Task tracking integrated with chat

## Development

### Directory Structure

```
project/
├── app/
│   ├── api/
│   │   └── chat/route.ts          # API route calling Python backend
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/                      # Chat components
│   │   ├── chat-input.tsx
│   │   ├── chat-message.tsx
│   │   └── todo-panel.tsx
│   ├── layout/                    # Layout components
│   │   ├── app-layout.tsx
│   │   ├── main-workarea.tsx
│   │   ├── sidebar.tsx
│   │   └── right-canvas.tsx
│   ├── artifacts/                 # Artifact viewer
│   │   └── code-viewer.tsx
│   └── ui/                        # UI primitives
├── lib/
│   ├── types.ts                   # TypeScript types
│   ├── store.ts                   # Zustand state management
│   └── hooks/
├── backend/
│   ├── app.py                     # FastAPI server
│   ├── requirements.txt
│   └── setup.sh
├── libs/deepagents/               # Deep Agents SDK
│   └── deepagents/
│       ├── __init__.py
│       ├── graph.py               # Agent creation
│       └── middleware/            # Agent middleware
```

### Key Files

- **`app/api/chat/route.ts`**: Next.js API route that:
  - Receives UIMessages from the frontend
  - Forwards to Python backend
  - Converts NDJSON response to SSE format

- **`backend/app.py`**: FastAPI server that:
  - Creates a Deep Agent using `create_deep_agent()`
  - Streams agent responses as NDJSON
  - Handles tool execution

- **`components/layout/main-workarea.tsx`**: Main chat interface using:
  - `useChat()` hook from AI SDK
  - `DefaultChatTransport` for SSE communication
  - Real-time message streaming

## Troubleshooting

### Backend Connection Error

If you see "Failed to process request":
1. Check that the Python backend is running on the configured URL
2. Verify `DEEP_AGENT_BACKEND_URL` matches your backend
3. Check backend logs for errors

### Anthropic API Key Error

If the backend fails with "ANTHROPIC_API_KEY not found":
1. Set your API key: `export ANTHROPIC_API_KEY='sk-ant-...'`
2. Or add it to a `.env` file in the backend directory

### Frontend Not Connecting

If streaming stops or doesn't work:
1. Check browser network tab for SSE connection
2. Verify the `/api/chat` route is receiving requests
3. Check that backend is responding with proper headers

## Next Steps

1. **Customize the system prompt**: Edit the `create_deep_agent()` call in `backend/app.py`
2. **Add custom tools**: Use Deep Agents middleware to add specialized tools
3. **Enable tracing**: Set up LangChain+ for agent execution tracing
4. **Deploy**: Use Vercel for frontend, cloud service for backend
5. **Extend UI**: Add more modules to the sidebar or customize layouts

## API Endpoint Reference

### POST /api/chat

Receives chat messages and streams responses.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Help me with something"
        }
      ]
    }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream of UI message chunks

**Backend Endpoint:** POST http://localhost:8000/chat

Accepts:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Help me with something"
    }
  ]
}
```

Returns: NDJSON stream with chunks:
```json
{"type": "text", "content": "..."}
{"type": "tool_call", "tool_name": "...", "tool_input": {...}}
{"type": "tool_result", "content": "..."}
```

## Additional Resources

- [Deep Agents Documentation](https://github.com/anthropics/deep-agents)
- [AI SDK 6 Docs](https://sdk.vercel.ai)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [Anthropic Claude API](https://docs.anthropic.com/)

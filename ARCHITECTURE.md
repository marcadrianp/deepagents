# Architecture: Deep Agents Web Application

## Overview

This is a hybrid web application that bridges the gap between a modern TypeScript/React frontend and a powerful Python agent backend:

```
┌──────────────────────────────────────────────────────────────┐
│                   User's Browser                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          Next.js 16 React Application                  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  UI Components (floating islands)                │  │  │
│  │  │  - Sidebar, MainWorkarea, RightCanvas           │  │  │
│  │  │  - ChatMessage, ChatInput, TodoPanel             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↕                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  State Management (Zustand + useChat)            │  │  │
│  │  │  - Layout state (sidebar, panels)                │  │  │
│  │  │  - Message history & streaming                   │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                        ↓                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  API Client (useChat hook)                       │  │  │
│  │  │  - Sends: UIMessage[] (with parts)               │  │  │
│  │  │  - Receives: SSE stream (text-delta, etc)        │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────────┘
               │
        ┌──────▼──────────────────────────────────────────┐
        │  HTTP POST /api/chat (Node.js Server)           │
        │                                                  │
        │  1. Receives: UIMessage[] with parts            │
        │  2. Extracts text from parts                    │
        │  3. Converts to backend format                  │
        │  4. Calls Python backend /chat endpoint         │
        │  5. Transforms NDJSON → SSE                     │
        │  6. Returns SSE stream to browser               │
        └──────┬───────────────────────────────────────────┘
               │
        ┌──────▼──────────────────────────────────────────┐
        │  HTTP POST /chat (Python FastAPI)               │
        │                                                  │
        │  1. Receives: messages (simple format)          │
        │  2. Creates Deep Agent instance                 │
        │  3. Streams agent.astream()                     │
        │  4. Processes LangGraph events                  │
        │  5. Converts to NDJSON format                   │
        │  6. Returns NDJSON stream                       │
        └──────┬───────────────────────────────────────────┘
               │
        ┌──────▼──────────────────────────────────────────┐
        │  Deep Agents Engine (LangGraph)                 │
        │                                                  │
        │  Agent State Machine:                           │
        │  1. Process user message                        │
        │  2. Decide on tool calls (if needed)            │
        │  3. Execute tools (with middleware)             │
        │  4. Process tool results                        │
        │  5. Generate response                           │
        │  6. Emit state updates                          │
        │                                                  │
        │  Available Tools:                               │
        │  - write_todos (TodoListMiddleware)             │
        │  - ls, read_file, write_file, ... (FilesystemM)│
        │  - execute (SandboxBackendProtocol)             │
        │  - task (SubAgentMiddleware)                    │
        └──────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Sends Message

```typescript
// Frontend (React component)
const { sendMessage } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" })
});

sendMessage({ text: "Create a React component" });
```

Converts to:
```json
{
  "messages": [
    {
      "id": "...",
      "role": "user",
      "parts": [{"type": "text", "text": "Create a React component"}]
    }
  ]
}
```

### 2. API Route Receives & Processes

```typescript
// app/api/chat/route.ts (Next.js API Route)
export async function POST(req: Request) {
  const { messages } = await req.json(); // UIMessage[]
  
  const chatMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.parts
      ?.filter(p => p.type === "text")
      .map(p => p.text)
      .join("")
  }));
  
  // Call Python backend
  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    body: JSON.stringify({ messages: chatMessages })
  });
  
  // Transform NDJSON stream to SSE and return
}
```

### 3. Python Backend Processes

```python
# backend/app.py (FastAPI)
@app.post("/chat")
async def chat(request: ChatRequest):
    agent = create_deep_agent(
        model="anthropic/claude-opus-4-6",
        system_prompt="..."
    )
    
    async for event in agent.astream(input_state, stream_mode="updates"):
        # Extract message from event
        # Convert to NDJSON format
        yield json.dumps({"type": "text", "content": "..."})
```

### 4. Response Streams Back

Backend streams NDJSON:
```json
{"type": "text", "content": "I'll create a React component"}
{"type": "tool_call", "tool_name": "write_file", "tool_input": {...}}
{"type": "tool_result", "content": "File written successfully"}
```

API route converts to SSE:
```
data: {"type":"text-delta","delta":"I'll create a React component"}

data: {"type":"tool-call-stream-start","toolCallId":"...","toolName":"write_file"}

data: [DONE]
```

Browser's `useChat` hook processes SSE and updates UI.

## Component Hierarchy

### Layout

```
<html>
  <body>
    <AppLayout>
      <Sidebar />              # Brand, search, modules, chat history
      <MiddleColumn />         # Skills, notes, workspace (optional)
      <MainWorkarea>           # Main chat interface
        <ChatMessage />*       # Message display with tool calls
        <ChatInput />          # User input with send button
        <TodoPanel />          # Task tracking from agent
      </MainWorkarea>
      <RightCanvas>           # Code artifacts viewer
        <CodeViewer />        # Syntax highlighted code display
      </RightCanvas>
    </AppLayout>
  </body>
</html>
```

### State Management

**Zustand Store (`lib/store.ts`):**
```typescript
interface AppStore {
  // UI State
  sidebarCollapsed: boolean
  rightCanvasOpen: boolean
  selectedModule: string
  
  // Chat State
  chatHistory: ChatSession[]
  artifacts: Artifact[]
  todos: Todo[]
  
  // Actions
  toggleSidebar()
  addArtifact(artifact)
  setTodos(todos)
}
```

**Chat State (AI SDK `useChat()`):**
```typescript
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" })
});
// messages: UIMessage[] with streaming updates
// status: "ready" | "submitted" | "streaming" | "error"
```

## Message Format Conversion

### Frontend → API Route

**UIMessage format** (from useChat):
```typescript
interface UIMessage {
  id: string
  role: "user" | "assistant" | "system"
  parts: Array<{
    type: "text" | "tool-invocation" | "tool-result" | ...
    text?: string
    toolInvocation?: { toolName, args, state, output }
  }>
}
```

### API Route → Python Backend

**Simple message format**:
```typescript
interface ChatMessage {
  role: string
  content: string  // Plain text extracted from parts
}
```

### Python Backend → Frontend

**NDJSON format** (streaming):
```json
{"type": "text", "content": "..."}
{"type": "tool_call", "tool_name": "...", "tool_input": {...}}
{"type": "tool_result", "content": "..."}
```

### Transformed to SSE

**SSE format** (Server-Sent Events):
```
data: {"type":"text-delta","delta":"..."}
data: {"type":"tool-call-stream-start","toolCallId":"...","toolName":"..."}
data: [DONE]
```

## Environment Configuration

### Frontend (.env.local)
```
DEEP_AGENT_BACKEND_URL=http://localhost:8000
```

### Backend (shell environment)
```
ANTHROPIC_API_KEY=sk-ant-...
LANGCHAIN_TRACING_V2=false
```

## Error Handling

### Frontend Level
- Connection errors: Show banner with retry button
- Invalid responses: Log to console, show generic error

### API Route Level
- Backend unreachable: Return 500 with error message
- Invalid request: Return 400
- Stream errors: Emit error event in SSE stream

### Backend Level
- Missing API key: Log error, return error event
- Tool execution failure: Return error in message stream
- Unhandled exceptions: Log and yield error message

## Performance Considerations

1. **Streaming**: Both SSE streams enable progressive rendering
2. **Message History**: Stored in Zustand for fast access
3. **Artifacts**: Only stored in memory (not persisted by default)
4. **Tool Execution**: Happens on backend, frontend just displays progress
5. **UI Updates**: React's key-based updates prevent re-renders

## Extensibility Points

### 1. Add Custom Tools

In `backend/app.py`:
```python
from langchain_core.tools import tool

@tool
def my_tool(arg: str) -> str:
    """Tool description."""
    return f"Result: {arg}"

agent = create_deep_agent(
    model="...",
    tools=[my_tool]  # Add here
)
```

### 2. Add UI Components

Create in `components/` and import into `MainWorkarea` or `RightCanvas`.

### 3. Customize Agent Behavior

Modify `create_deep_agent()` call:
```python
agent = create_deep_agent(
    model="anthropic/claude-opus-4-6",
    system_prompt="Custom instructions...",
    middleware=[CustomMiddleware()],  # Add middleware
    subagents=[...],  # Add subagents
    memory=[...],  # Add memory
)
```

### 4. Add Authentication

- Frontend: Use Auth.js or similar
- Backend: Add authentication middleware to FastAPI
- API Route: Add session validation

## Deployment

### Frontend (Next.js)
- Deploy to Vercel or any Node.js hosting
- Set `DEEP_AGENT_BACKEND_URL` environment variable

### Backend (Python)
- Deploy to Railway, Render, AWS Lambda, etc.
- Expose `/chat` and `/health` endpoints
- Set `ANTHROPIC_API_KEY` environment variable
- Use production ASGI server (gunicorn, uvicorn)

## Testing

### Frontend Components
- Use Jest + React Testing Library
- Mock `useChat()` hook for tests

### API Route
- Test with curl or Postman
- Mock backend responses
- Test stream parsing logic

### Backend
- Use pytest
- Mock LLM responses
- Test tool execution

## Security Considerations

1. **API Keys**: Never expose in frontend
2. **Tool Execution**: Validate inputs before executing
3. **File Operations**: Restrict to specific directories
4. **CORS**: Configure properly for frontend domain
5. **Rate Limiting**: Add on API route if needed

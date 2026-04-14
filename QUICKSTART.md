# Quick Start Guide

Get the Deep Agents Web App running in minutes!

## Option 1: Docker (Easiest)

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY="sk-ant-..."

# Start both frontend and backend
docker-compose up

# Open http://localhost:3000
```

Done! The backend and frontend will start automatically and find each other.

## Option 2: Manual Setup

### Terminal 1 - Start the Python Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt
pip install -e ../libs/deepagents

# Set your API key and run
export ANTHROPIC_API_KEY="sk-ant-..."
python app.py
```

You'll see: `INFO: Uvicorn running on http://0.0.0.0:8000`

### Terminal 2 - Start the Next.js Frontend

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

You'll see: `▲ Next.js 16.0.0`

Open [http://localhost:3000](http://localhost:3000) in your browser!

## First Chat

1. Click in the chat input at the bottom
2. Type a message like:
   - `"Create a React component for a todo list"`
   - `"Write a Python script to analyze CSV files"`
   - `"Plan a project for building a blog platform"`
3. Press Enter or click Send

Watch as the Deep Agent:
- Plans the task with todos
- Executes commands
- Creates code artifacts
- Shows real-time streaming responses

## Troubleshooting

### "Failed to process request"
- Make sure backend is running on `http://localhost:8000`
- Check `DEEP_AGENT_BACKEND_URL` in `.env.local`

### "ANTHROPIC_API_KEY not found"
- Set it in your environment: `export ANTHROPIC_API_KEY="sk-ant-..."`
- Or create a `.env` file in the `backend/` folder

### Port already in use
- Backend: Change `python app.py` to run on a different port (edit `app.py`)
- Frontend: `npm run dev -- -p 3001` to use port 3001

## What's Happening?

1. **You type a message** → Next.js frontend sends it to `/api/chat`
2. **API route processes it** → Converts to format for Python backend
3. **Python backend streams** → Deep Agent SDK processes with tool calling
4. **Responses stream back** → Converted to SSE format for browser
5. **Real-time UI updates** → Messages and artifacts appear as they're generated

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for how components work together
- Customize the system prompt in `backend/app.py`
- Add more tools via Deep Agents middleware

## Get Help

Check the logs:
- **Backend issues**: Look at terminal where `python app.py` runs
- **Frontend issues**: Check browser console (F12) and terminal where `npm run dev` runs
- **Network issues**: Check browser Network tab in DevTools

Enjoy building with Deep Agents! 🚀

"""FastAPI backend using Deep Agents SDK."""

import json
import logging
import sys
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Add libs to path to import deepagents
sys.path.insert(0, "/vercel/share/v0-project/libs")

from deepagents import create_deep_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


class ChatMessage(BaseModel):
    """Message in the chat history."""

    role: str
    content: str


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""

    messages: list[ChatMessage]
    thread_id: str | None = None


class ChatDelta(BaseModel):
    """Streaming response delta."""

    type: str
    content: str | None = None
    tool_name: str | None = None
    tool_input: dict | None = None
    tool_output: str | None = None


async def stream_agent_response(
    messages: list[ChatMessage],
) -> AsyncGenerator[str, None]:
    """Stream responses from the Deep Agent.

    Args:
        messages: Chat history to pass to the agent.

    Yields:
        JSON-encoded chat deltas for streaming to the client.
    """
    try:
        # Create the Deep Agent with default tools
        agent = create_deep_agent(
            model="anthropic/claude-opus-4-6",
            system_prompt="You are a helpful AI assistant with access to powerful tools.",
        )

        # Convert message format for the agent
        input_state = {
            "messages": [
                {"role": msg.role, "content": msg.content} for msg in messages
            ]
        }

        # Stream the agent's response
        # The agent returns an async iterator of state updates
        async for event in agent.astream(input_state, stream_mode="updates"):
            logger.info(f"Agent event: {event}")

            # Extract the latest messages from the state
            if "agent" in event:
                agent_state = event["agent"]
                if "messages" in agent_state:
                    latest_messages = agent_state["messages"]
                    if latest_messages:
                        latest_msg = latest_messages[-1]

                        # Handle different message types
                        if hasattr(latest_msg, "type"):
                            if latest_msg.type == "ai":
                                # AI message with potential tool calls
                                if hasattr(latest_msg, "content"):
                                    yield json.dumps(
                                        {
                                            "type": "text",
                                            "content": latest_msg.content,
                                        }
                                    ) + "\n"

                                if hasattr(latest_msg, "tool_calls"):
                                    for tool_call in latest_msg.tool_calls:
                                        yield json.dumps(
                                            {
                                                "type": "tool_call",
                                                "tool_name": tool_call.get("name"),
                                                "tool_input": tool_call.get("args"),
                                            }
                                        ) + "\n"

                            elif latest_msg.type == "tool":
                                # Tool result message
                                yield json.dumps(
                                    {
                                        "type": "tool_result",
                                        "content": latest_msg.content,
                                    }
                                ) + "\n"

    except Exception as e:
        logger.error(f"Error in stream_agent_response: {e}", exc_info=True)
        yield json.dumps({"type": "error", "content": str(e)}) + "\n"


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat endpoint that streams responses from the Deep Agent.

    Args:
        request: Chat request with message history.

    Returns:
        StreamingResponse with newline-delimited JSON chunks.
    """
    return StreamingResponse(
        stream_agent_response(request.messages),
        media_type="application/x-ndjson",
    )


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

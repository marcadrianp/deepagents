import { UIMessage } from "ai";

export const maxDuration = 60;

const BACKEND_URL = process.env.DEEP_AGENT_BACKEND_URL || "http://localhost:8000";

/**
 * Convert streaming NDJSON response to SSE format for the frontend.
 * The Deep Agents Python backend streams newline-delimited JSON.
 * We need to convert it to the UI Message Stream format expected by useChat.
 */
async function* transformBackendStream(
  response: Response
): AsyncGenerator<string, void> {
  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let messageId = crypto.randomUUID();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk = JSON.parse(line);

            // Convert backend response format to UI Message Stream format
            if (chunk.type === "text") {
              yield `data: ${JSON.stringify({
                type: "text-delta",
                delta: chunk.content || "",
              })}\n\n`;
            } else if (chunk.type === "tool_call") {
              yield `data: ${JSON.stringify({
                type: "tool-call-stream-start",
                toolCallId: messageId,
                toolName: chunk.tool_name,
              })}\n\n`;

              if (chunk.tool_input) {
                yield `data: ${JSON.stringify({
                  type: "tool-call-delta",
                  toolCallId: messageId,
                  argsTextDelta: JSON.stringify(chunk.tool_input),
                })}\n\n`;
              }
            } else if (chunk.type === "tool_result") {
              yield `data: ${JSON.stringify({
                type: "tool-result",
                toolCallId: messageId,
                result: chunk.content,
              })}\n\n`;
            } else if (chunk.type === "error") {
              yield `data: ${JSON.stringify({
                type: "text-delta",
                delta: `Error: ${chunk.content}`,
              })}\n\n`;
            }
          } catch (e) {
            console.error("Error parsing backend chunk:", e);
          }
        }
      }
    }

    // Signal completion
    yield `data: [DONE]\n\n`;
  } catch (error) {
    console.error("Error in stream transformation:", error);
    yield `data: ${JSON.stringify({
      type: "text-delta",
      delta: `Stream error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })}\n\n`;
  } finally {
    reader.releaseLock();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as { messages: UIMessage[] };

    // Convert UIMessage format to simple chat messages for the backend
    const chatMessages = messages.map((msg) => ({
      role: msg.role,
      content:
        msg.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p as any).text)
          .join("") || "",
    }));

    // Call the Python backend
    const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatMessages,
      }),
    });

    if (!backendResponse.ok) {
      throw new Error(
        `Backend error: ${backendResponse.status} ${backendResponse.statusText}`
      );
    }

    // Transform the backend's NDJSON stream to SSE format
    const transformedStream = transformBackendStream(backendResponse);

    return new Response(
      (async function* () {
        for await (const chunk of transformedStream) {
          yield chunk;
        }
      })(),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

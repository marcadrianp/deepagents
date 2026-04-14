import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  UIMessage,
  validateUIMessages,
} from "ai";
import { agentTools } from "@/lib/agent/tools";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Deep Agent, a helpful AI assistant with access to powerful tools for coding, research, and task management.

## Your Capabilities

You have access to the following tools:
- **File Operations**: read_file, write_file, edit_file, ls, grep - for working with files
- **Shell Execution**: execute - for running commands in a sandbox
- **Web Search**: web_search - for finding current information
- **Planning**: write_todos, update_todo - for breaking down complex tasks

## Guidelines

1. **Be Proactive**: When given a task, break it down into steps and execute them systematically.
2. **Use Tools Wisely**: Choose the right tool for each task. Read files before editing, search before assuming.
3. **Plan Complex Tasks**: For multi-step tasks, use write_todos to create a clear plan.
4. **Show Progress**: Keep the user informed about what you're doing and why.
5. **Handle Errors Gracefully**: If a tool fails, explain what happened and try an alternative approach.

## Response Style

- Be concise but informative
- Use code blocks for code snippets
- Explain your reasoning when making decisions
- Ask clarifying questions if the task is ambiguous

You are running in a sandbox environment. All file operations and commands are executed safely.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // For UIMessage format (from useChat with DefaultChatTransport)
    const messages = body.messages as UIMessage[];

    // Validate and convert messages
    const validatedMessages = await validateUIMessages({
      messages,
      tools: agentTools,
    });

    const result = streamText({
      model: "anthropic/claude-opus-4-6",
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(validatedMessages),
      tools: agentTools,
      stopWhen: stepCountIs(10),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

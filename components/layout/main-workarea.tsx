"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAppStore } from "@/lib/store";
import { Island } from "@/components/ui/island";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput, TypingIndicator } from "@/components/chat/chat-input";
import { TodoPanel } from "@/components/chat/todo-panel";
import {
  MenuIcon,
  PanelRightIcon,
  SettingsIcon,
  BrainIcon,
  PlusIcon,
  CodeIcon,
  SearchIcon,
} from "@/components/ui/icons";
import type { Message, ToolCall } from "@/lib/types";

export function MainWorkarea() {
  const {
    toggleSidebar,
    toggleRightCanvas,
    rightCanvasOpen,
    sidebarCollapsed,
    todos,
    addArtifact,
    setTodos,
  } = useAppStore();

  const [title, setTitle] = useState("New Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Use the AI SDK useChat hook with streaming
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Extract text content from message parts
  const getMessageText = (parts: (typeof messages)[0]["parts"]) => {
    if (!parts) return "";
    return parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  };

  // Process tool invocations from message parts
  const processToolCalls = (parts: (typeof messages)[0]["parts"]): ToolCall[] => {
    if (!parts) return [];
    return parts
      .filter(
        (p): p is { type: "tool-invocation"; toolInvocation: unknown } =>
          p.type === "tool-invocation"
      )
      .map((p) => {
        const inv = p.toolInvocation as {
          toolCallId: string;
          toolName: string;
          args: Record<string, unknown>;
          state: string;
          output?: unknown;
        };

        // Handle write_todos tool to update the todo panel
        if (inv.toolName === "write_todos" && inv.state === "output-available") {
          const result = inv.output as { todos?: Array<{ id: string; task: string; status: string }> };
          if (result?.todos) {
            setTodos(
              result.todos.map((t) => ({
                id: t.id,
                task: t.task,
                status: t.status as "todo" | "in_progress" | "done",
              }))
            );
          }
        }

        // Handle write_file tool to create artifacts
        if (inv.toolName === "write_file" && inv.state === "output-available") {
          const args = inv.args as { path: string; content: string };
          addArtifact({
            id: inv.toolCallId,
            name: args.path.split("/").pop() || args.path,
            type: "code",
            content: args.content,
            language: getLanguageFromPath(args.path),
            createdAt: new Date(),
          });
        }

        return {
          id: inv.toolCallId,
          name: inv.toolName,
          args: inv.args,
          status: mapToolState(inv.state),
        } as ToolCall;
      });
  };

  const mapToolState = (state: string): ToolCall["status"] => {
    switch (state) {
      case "input-streaming":
      case "input-available":
        return "pending";
      case "output-available":
        return "success";
      case "output-error":
        return "error";
      default:
        return "running";
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      rb: "ruby",
      go: "go",
      rs: "rust",
      java: "java",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
    };
    return langMap[ext || ""] || "plaintext";
  };

  // Convert messages for display
  const formattedMessages: Message[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: getMessageText(msg.parts),
    createdAt: new Date(),
    toolCalls: processToolCalls(msg.parts),
  }));

  // Update title based on first user message
  useEffect(() => {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg) {
      const text = getMessageText(firstUserMsg.parts);
      setTitle(text.slice(0, 50) + (text.length > 50 ? "..." : ""));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      await sendMessage({ text: content });
    },
    [isLoading, sendMessage]
  );

  return (
    <Island className="flex-1 min-w-0">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            {sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            )}
            <h2 className="font-semibold text-foreground">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRightCanvas}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                rightCanvasOpen
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title="Toggle artifacts panel"
            >
              <PanelRightIcon className="h-5 w-5" />
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="Settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {formattedMessages.length > 0 ? (
            <div className="flex flex-col gap-6 p-6">
              {/* Todo Panel (if active) */}
              {todos.length > 0 && (
                <div className="mb-4">
                  <TodoPanel />
                </div>
              )}

              {/* Messages */}
              {formattedMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <BrainIcon className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-secondary">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <BrainIcon className="h-10 w-10" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                Welcome to Deep Agents
              </h3>
              <p className="mb-8 max-w-md text-center text-muted-foreground leading-relaxed">
                Start a conversation with your AI assistant. I can help you with
                coding, research, planning, and more.
              </p>

              {/* Quick Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => handleSendMessage("Help me write a React component")}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left hover:border-primary hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CodeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Write Code</p>
                    <p className="text-sm text-muted-foreground">
                      Create or edit code files
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleSendMessage("Research the latest trends in AI")}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left hover:border-primary hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Research</p>
                    <p className="text-sm text-muted-foreground">
                      Deep dive into any topic
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </Island>
  );
}

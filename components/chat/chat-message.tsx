"use client";

import { useState } from "react";
import type { Message, ToolCall } from "@/lib/types";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  LoaderIcon,
  AlertCircleIcon,
  TerminalIcon,
  CodeIcon,
  BrainIcon,
} from "@/components/ui/icons";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BrainIcon className="h-4 w-4" />
        </div>
      )}

      <div className={`flex max-w-2xl flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Content */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="m-0 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {message.toolCalls.map((toolCall) => (
              <ToolCallDisplay key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground">
          {formatTime(message.createdAt)}
        </span>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <span className="text-sm font-medium">U</span>
        </div>
      )}
    </div>
  );
}

function ToolCallDisplay({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case "running":
        return <LoaderIcon className="h-4 w-4 text-warning" />;
      case "success":
        return <CheckCircleIcon className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircleIcon className="h-4 w-4 text-destructive" />;
      default:
        return <TerminalIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getToolIcon = () => {
    if (toolCall.name.includes("execute") || toolCall.name.includes("shell")) {
      return <TerminalIcon className="h-4 w-4" />;
    }
    return <CodeIcon className="h-4 w-4" />;
  };

  const statusClass = {
    pending: "tool-call-pending",
    running: "tool-call-pending",
    success: "tool-call-success",
    error: "tool-call-error",
  }[toolCall.status];

  return (
    <div className={`tool-call ${statusClass} overflow-hidden rounded-xl`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground">
          {getToolIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{toolCall.name}</p>
          <p className="text-xs text-muted-foreground">
            {toolCall.status === "running" ? "Running..." : toolCall.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {expanded ? (
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-3">
          <pre className="overflow-x-auto rounded-lg bg-card p-3 text-xs font-mono text-foreground">
            {JSON.stringify(toolCall.args, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PaperclipIcon, SendIcon } from "@/components/ui/icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Message Deep Agent...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setValue("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          title="Attach file"
        >
          <PaperclipIcon className="h-5 w-5" />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="mt-1 px-2">
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}

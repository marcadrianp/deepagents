"use client";

import { useAppStore } from "@/lib/store";
import {
  CheckCircleIcon,
  CircleIcon,
  LoaderIcon,
  ListTodoIcon,
} from "@/components/ui/icons";
import type { TodoItem } from "@/lib/types";

export function TodoPanel() {
  const { todos } = useAppStore();

  if (todos.length === 0) {
    return null;
  }

  const completed = todos.filter((t) => t.status === "done").length;
  const total = todos.length;
  const progress = (completed / total) * 100;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodoIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Task Plan</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {completed}/{total} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Todo Items */}
      <div className="flex flex-col gap-2">
        {todos.map((todo) => (
          <TodoItemDisplay key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}

function TodoItemDisplay({ todo }: { todo: TodoItem }) {
  const getStatusIcon = () => {
    switch (todo.status) {
      case "done":
        return <CheckCircleIcon className="h-5 w-5 text-success" />;
      case "in_progress":
        return <LoaderIcon className="h-5 w-5 text-primary" />;
      default:
        return <CircleIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
        todo.status === "in_progress"
          ? "bg-primary/10"
          : todo.status === "done"
            ? "opacity-60"
            : ""
      }`}
    >
      {getStatusIcon()}
      <span
        className={`text-sm ${
          todo.status === "done"
            ? "text-muted-foreground line-through"
            : "text-foreground"
        }`}
      >
        {todo.task}
      </span>
    </div>
  );
}

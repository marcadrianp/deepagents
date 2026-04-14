"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Island } from "@/components/ui/island";
import {
  MessageSquareIcon,
  ZapIcon,
  StickyNoteIcon,
  FolderIcon,
  PlayIcon,
  SearchIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
  FileIcon,
  BrainIcon,
} from "@/components/ui/icons";
import type { ModuleType } from "@/lib/types";

interface SidebarProps {
  collapsed: boolean;
}

const modules: { id: ModuleType; label: string; icon: typeof MessageSquareIcon }[] = [
  { id: "chat", label: "Chat", icon: MessageSquareIcon },
  { id: "skills", label: "Skills", icon: ZapIcon },
  { id: "notes", label: "Notes", icon: StickyNoteIcon },
  { id: "workspace", label: "Workspace", icon: FolderIcon },
  { id: "playground", label: "Playground", icon: PlayIcon },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const {
    activeModule,
    setActiveModule,
    threads,
    activeThreadId,
    setActiveThread,
    createThread,
    toggleSidebar,
  } = useAppStore();

  const [podsExpanded, setPodsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Group threads by date
  const groupedThreads = threads.reduce(
    (groups, thread) => {
      const today = new Date();
      const threadDate = new Date(thread.updatedAt);
      const diffDays = Math.floor(
        (today.getTime() - threadDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      let groupKey: string;
      if (diffDays === 0) {
        groupKey = "Today";
      } else if (diffDays === 1) {
        groupKey = "Yesterday";
      } else if (diffDays < 7) {
        groupKey = "This Week";
      } else {
        groupKey = "Earlier";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(thread);
      return groups;
    },
    {} as Record<string, typeof threads>
  );

  const filteredThreads = searchQuery
    ? threads.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  if (collapsed) {
    return (
      <Island className="w-20 flex-shrink-0 animate-slide-left">
        <div className="flex flex-col items-center gap-4 p-4">
          {/* Collapsed Logo */}
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <BrainIcon className="h-5 w-5" />
          </button>

          {/* Collapsed Module Icons */}
          <div className="flex flex-col gap-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  title={module.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          {/* New Chat Button */}
          <button
            onClick={createThread}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="New Chat"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </Island>
    );
  }

  return (
    <Island className="w-72 flex-shrink-0 animate-slide-left">
      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrainIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Deep Agents</h1>
            <p className="text-xs text-muted-foreground">AI Agent Interface</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Module Switcher (Horizontal Tabs) */}
        <div className="flex items-center justify-between gap-1 border-b border-border p-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={module.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Contextual Menu */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeModule === "chat" && (
            <div className="flex flex-col gap-3">
              {/* New Chat Button */}
              <button
                onClick={createThread}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                New Chat
              </button>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <BookOpenIcon className="h-4 w-4" />
                  Knowledge Base
                </button>
                <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <FileIcon className="h-4 w-4" />
                  Files
                </button>
              </div>

              {/* Pods Accordion */}
              <div>
                <button
                  onClick={() => setPodsExpanded(!podsExpanded)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <span>Pods</span>
                  {podsExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {podsExpanded && (
                  <div className="ml-3 flex flex-col gap-1 pt-1">
                    <button className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                      <span>All Chats</span>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium">
                        {threads.length}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModule === "skills" && (
            <div className="flex flex-col gap-2">
              <p className="px-3 text-xs font-medium uppercase text-muted-foreground">
                Available Skills
              </p>
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <ZapIcon className="h-4 w-4" />
                Code Review
              </button>
              <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <ZapIcon className="h-4 w-4" />
                Research
              </button>
            </div>
          )}
        </div>

        {/* History Feed */}
        <div className="flex-1 overflow-y-auto border-t border-border">
          <div className="p-3">
            <p className="px-3 pb-2 text-xs font-medium uppercase text-muted-foreground">
              History
            </p>
            {filteredThreads ? (
              // Search results
              <div className="flex flex-col gap-1">
                {filteredThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThread(thread.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeThreadId === thread.id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{thread.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Grouped by date
              Object.entries(groupedThreads).map(([group, groupThreads]) => (
                <div key={group} className="mb-3">
                  <p className="px-3 pb-1 text-xs text-muted-foreground">{group}</p>
                  <div className="flex flex-col gap-1">
                    {groupThreads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => setActiveThread(thread.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          activeThreadId === thread.id
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{thread.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
            {threads.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            )}
          </div>
        </div>
      </div>
    </Island>
  );
}

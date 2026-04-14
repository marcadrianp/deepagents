"use client";

import { useAppStore } from "@/lib/store";
import { Island } from "@/components/ui/island";
import {
  XIcon,
  ZapIcon,
  StickyNoteIcon,
  FolderIcon,
  PlusIcon,
} from "@/components/ui/icons";

export function MiddleColumn() {
  const { activeModule, toggleMiddleColumn } = useAppStore();

  const getModuleContent = () => {
    switch (activeModule) {
      case "skills":
        return <SkillsContent />;
      case "notes":
        return <NotesContent />;
      case "workspace":
        return <WorkspaceContent />;
      default:
        return null;
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case "skills":
        return "Skills";
      case "notes":
        return "Notes";
      case "workspace":
        return "Workspace";
      default:
        return "";
    }
  };

  return (
    <Island className="w-80 flex-shrink-0 animate-slide-left">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold text-foreground">{getModuleTitle()}</h2>
          <button
            onClick={toggleMiddleColumn}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{getModuleContent()}</div>
      </div>
    </Island>
  );
}

function SkillsContent() {
  const skills = [
    {
      id: "code-review",
      name: "Code Review",
      description: "Analyze code for issues and improvements",
    },
    {
      id: "research",
      name: "Research",
      description: "Deep research with web search",
    },
    {
      id: "planning",
      name: "Planning",
      description: "Break down tasks into steps",
    },
    {
      id: "writing",
      name: "Writing",
      description: "Content creation and editing",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <PlusIcon className="h-4 w-4" />
        Create Skill
      </button>

      <div className="flex flex-col gap-2">
        {skills.map((skill) => (
          <button
            key={skill.id}
            className="flex items-start gap-3 rounded-xl border border-border p-3 text-left hover:border-primary hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ZapIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{skill.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {skill.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NotesContent() {
  const notes = [
    { id: "1", title: "Project Ideas", preview: "List of project ideas..." },
    { id: "2", title: "Meeting Notes", preview: "Discussion about..." },
    { id: "3", title: "Research Links", preview: "Useful resources..." },
  ];

  return (
    <div className="flex flex-col gap-3">
      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <PlusIcon className="h-4 w-4" />
        New Note
      </button>

      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <button
            key={note.id}
            className="flex items-start gap-3 rounded-xl border border-border p-3 text-left hover:border-primary hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <StickyNoteIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{note.title}</p>
              <p className="text-sm text-muted-foreground truncate">
                {note.preview}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkspaceContent() {
  const files = [
    { id: "1", name: "src/", type: "folder" as const },
    { id: "2", name: "package.json", type: "file" as const },
    { id: "3", name: "README.md", type: "file" as const },
  ];

  return (
    <div className="flex flex-col gap-3">
      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <PlusIcon className="h-4 w-4" />
        Upload Files
      </button>

      <div className="flex flex-col gap-1">
        {files.map((file) => (
          <button
            key={file.id}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
          >
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{file.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Artifact } from "@/lib/types";
import { CheckCircleIcon, CodeIcon } from "@/components/ui/icons";

interface CodeViewerProps {
  artifact: Artifact;
}

export function CodeViewer({ artifact }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = artifact.content.split("\n");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <CodeIcon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-foreground">
            {artifact.name}
          </span>
          {artifact.language && (
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {artifact.language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <CheckCircleIcon className="h-4 w-4 text-success" />
              Copied
            </>
          ) : (
            "Copy"
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto bg-card">
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="sticky left-0 flex flex-col bg-secondary/50 px-3 py-4 text-right font-mono text-xs text-muted-foreground select-none">
            {lines.map((_, i) => (
              <span key={i} className="leading-6">
                {i + 1}
              </span>
            ))}
          </div>

          {/* Code */}
          <pre className="flex-1 overflow-x-auto p-4">
            <code className="font-mono text-sm text-foreground leading-6">
              {artifact.content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

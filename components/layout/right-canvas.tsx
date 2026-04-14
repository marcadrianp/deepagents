"use client";

import { useAppStore } from "@/lib/store";
import { Island } from "@/components/ui/island";
import { CodeViewer } from "@/components/artifacts/code-viewer";
import {
  XIcon,
  FileIcon,
  CodeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

export function RightCanvas() {
  const {
    artifacts,
    activeArtifactId,
    setActiveArtifact,
    toggleRightCanvas,
  } = useAppStore();

  const activeArtifact = artifacts.find((a) => a.id === activeArtifactId);
  const activeIndex = artifacts.findIndex((a) => a.id === activeArtifactId);

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveArtifact(artifacts[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < artifacts.length - 1) {
      setActiveArtifact(artifacts[activeIndex + 1].id);
    }
  };

  return (
    <Island className="w-96 flex-shrink-0 animate-slide-right">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">Artifacts</h2>
            {artifacts.length > 0 && (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {activeIndex + 1}/{artifacts.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {artifacts.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeIndex === artifacts.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={toggleRightCanvas}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeArtifact ? (
            activeArtifact.type === "code" ? (
              <CodeViewer artifact={activeArtifact} />
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <FileIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-foreground">
                    {activeArtifact.name}
                  </span>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {activeArtifact.content}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <CodeIcon className="h-8 w-8" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">
                No Artifacts Yet
              </h3>
              <p className="text-sm text-muted-foreground">
                When the AI generates code or files, they will appear here for easy
                viewing and copying.
              </p>
            </div>
          )}
        </div>

        {/* Artifact List (when multiple) */}
        {artifacts.length > 1 && (
          <div className="border-t border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              All Artifacts
            </p>
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => setActiveArtifact(artifact.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeArtifactId === artifact.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {artifact.type === "code" ? (
                    <CodeIcon className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{artifact.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Island>
  );
}

"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "./sidebar";
import { MiddleColumn } from "./middle-column";
import { MainWorkarea } from "./main-workarea";
import { RightCanvas } from "./right-canvas";

export function AppLayout() {
  const {
    sidebarCollapsed,
    middleColumnOpen,
    rightCanvasOpen,
    setSidebarCollapsed,
  } = useAppStore();

  // Handle responsive sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse sidebar on narrow screens when right canvas is open
      if (window.innerWidth < 1280 && rightCanvasOpen) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [rightCanvasOpen, setSidebarCollapsed]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background p-4 gap-4">
      {/* Column 1: Left Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Column 2: Dynamic Middle Column (hidden by default) */}
      {middleColumnOpen && <MiddleColumn />}

      {/* Column 3: Main Workarea (fluid width) */}
      <MainWorkarea />

      {/* Column 4: Right Artifact Canvas */}
      {rightCanvasOpen && <RightCanvas />}
    </div>
  );
}

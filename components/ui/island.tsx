"use client";

import { forwardRef } from "react";

interface IslandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Island = forwardRef<HTMLDivElement, IslandProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`island flex flex-col overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Island.displayName = "Island";

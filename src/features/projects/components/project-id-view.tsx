"use client";

import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

const Tab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      className={cn(
        "relative flex items-center gap-2 px-4 h-full cursor-pointer text-sm font-medium transition-colors",
        "border-x border-t rounded-t-md",
        "hover:bg-accent/50",
        isActive
          ? "bg-background text-foreground border-border"
          : "bg-sidebar text-muted-foreground border-transparent hover:border-border/50",
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-background" />
      )}
    </button>
  );
};

export const ProjectIdView = ({
  projectId: _projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const [activeTabView, setActiveTabView] = useState<"preview" | "editor">(
    "editor",
  );
  return (
    <div className="h-full flex flex-col">
      <nav className="h-[35px] flex items-end bg-sidebar border-b border-border">
        <Tab
          label="Preview"
          isActive={activeTabView === "preview"}
          onClick={() => setActiveTabView("preview")}
        />
        <Tab
          label="Code"
          isActive={activeTabView === "editor"}
          onClick={() => setActiveTabView("editor")}
        />
        <div className="flex-1 flex justify-end h-full">
          <button
            type="button"
            className="relative flex items-center gap-1.5 px-4 h-full cursor-pointer text-sm font-medium transition-colors border-x border-t rounded-t-md hover:bg-accent/50 bg-sidebar text-muted-foreground border-transparent hover:border-border/50"
          >
            <FaGithub className="size-4" />
            <span>Export</span>
          </button>
        </div>
      </nav>
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            activeTabView === "editor" ? "visible" : "invisible",
          )}
        >
          <div className="">Editor View</div>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            activeTabView === "preview" ? "visible" : "invisible",
          )}
        >
          <div className="">Preview View</div>
        </div>
      </div>
    </div>
  );
};

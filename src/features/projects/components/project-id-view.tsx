"use client";

import { Allotment } from "allotment";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FileExplorer } from "@/features/projects/components/file-explorer";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 450;
const DEFAULT_MAIN_SIZE = 1000;

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

export const ProjectIdView = ({ projectId }: { projectId: Id<"projects"> }) => {
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
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer projectId={projectId} />
            </Allotment.Pane>
            <Allotment.Pane>
              <p className="">Code Editor view</p>
            </Allotment.Pane>
          </Allotment>
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

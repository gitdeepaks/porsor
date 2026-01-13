import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useEditor } from "@/features/projects/hooks/use-editor";
import { useFile } from "@/features/projects/hooks/use-fles";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../convex/_generated/dataModel";

const Tab = ({
  fileId,
  isFirst,
  projectId,
}: {
  fileId: Id<"files">;
  isFirst: boolean;
  projectId: Id<"projects">;
}) => {
  const file = useFile(fileId);
  const { activeTabId, previewTabId, setActiveTab, closeTab, openFile } =
    useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.name ?? "Loading...";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: tab interaction pattern
    // biome-ignore lint/a11y/useKeyWithClickEvents: double-click handler needed
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-8.75 px-3 cursor-pointer text-muted-foreground group",
        "border-x border-t border-transparent",
        "transition-colors duration-150 ease-in-out",
        "hover:bg-accent/40 hover:text-foreground/80",
        "relative",
        isActive &&
          "bg-background text-foreground border-x-border border-t-border border-b-transparent shadow-sm z-10",
        isFirst && "border-l-transparent",
        !isActive && "border-b-border/30",
      )}
    >
      {file === undefined ? (
        <Spinner className="text-ring size-4 shrink-0" />
      ) : (
        <FileIcon fileName={fileName} autoAssign className="size-4 shrink-0" />
      )}
      <span
        className={cn(
          "text-sm whitespace-nowrap truncate max-w-[200px]",
          isPreview && "italic",
        )}
      >
        {fileName}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeTab(fileId);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId);
          }
        }}
        className={cn(
          "ml-1 p-0.5 rounded-sm shrink-0",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "hover:bg-accent/60 active:bg-accent/80",
          isActive && "opacity-100",
        )}
        aria-label={`Close ${fileName}`}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
};

export const TopNavigation = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { openTabs } = useEditor(projectId);

  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex items-end h-8.75 border-b border-border/50">
        {openTabs.map((fileId, index) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            projectId={projectId}
          />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

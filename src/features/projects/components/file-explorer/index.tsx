/** biome-ignore-all lint/complexity/noUselessFragments: <explanation> */
import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusIcon,
  FolderPlusIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateInput } from "@/features/projects/components/file-explorer/create-input";
import { LoadingRow } from "@/features/projects/components/file-explorer/loading-row";
import { Tree } from "@/features/projects/components/file-explorer/tree";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
} from "@/features/projects/hooks/use-fles";
import { useProject } from "@/features/projects/hooks/use-projects";
import { cn } from "@/lib/utils";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface FileExplorerProps {
  projectId: Id<"projects">;
}

export const FileExplorer = ({ projectId }: FileExplorerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const project = useProject(projectId);
  const rootFiles = useFolderContents({ projectId, enabled: isOpen });
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const hanldeCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: undefined,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: undefined,
      });
    }
  };

  return (
    <div className="h-ful bg-sidebar">
      <ScrollArea>
        {/** biome-ignore lint/a11y/useSemanticElements: <explanation> */}
        {/** biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
        <div
          role="button"
          onClick={() => setIsOpen((open) => !open)}
          className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-90",
            )}
          />
          <p className="text-xs uppercase line-clamp-1 ">
            {project?.name ?? "Loading..."}
          </p>
          <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating("file");
              }}
              variant="highlight"
              size="icon-xs"
            >
              <FilePlusIcon className="size-3.5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCreating("folder");
              }}
              variant="highlight"
              size="icon-xs"
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(true);
                setCollapseKey((prev) => prev + 1);
              }}
              variant="highlight"
              size="icon-xs"
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        {isOpen && (
          <>
            {rootFiles === undefined && <LoadingRow level={0} />}
            {creating && (
              <CreateInput
                type={creating}
                level={0}
                onSubmit={hanldeCreate}
                onCancel={() => setCreating(null)}
              />
            )}
            {rootFiles?.map((item) => (
              <Tree
                key={`${item._id}-${item.name}`}
                item={item}
                level={0}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </ScrollArea>
    </div>
  );
};

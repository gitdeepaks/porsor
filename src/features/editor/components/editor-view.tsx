import Image from "next/image";
import { useEffect, useRef } from "react";
import { CodeEditor } from "@/features/editor/components/code-editor";
import FileBreadCrumbs from "@/features/editor/components/file-breadcrumbs";
import { TopNavigation } from "@/features/editor/components/top-navigation";
import { useEditor } from "@/features/projects/hooks/use-editor";
import { useFile, useUpdateFile } from "@/features/projects/hooks/use-fles";
import type { Id } from "../../../../convex/_generated/dataModel";

const DEBOUNCE_TIME = 1500;

interface EditorViewProps {
  projectId: Id<"projects">;
}

export const EditorView = ({ projectId }: EditorViewProps) => {
  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId);

  const updateFile = useUpdateFile();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActiveFileBinary = activeFile && activeFile.storageId;
  const isActiveFileText = activeFile && !activeFile.storageId;

  // biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to clear the timeout when the activeTabId changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {activeTabId && <FileBreadCrumbs projectId={projectId} />}
      <div className="flex-1 min-h-0 bg-background">
        {!activeFile && (
          <div className="size-full flex items-center justify-center">
            <Image
              src="/logo-alt.svg"
              alt="porsor"
              width={1150}
              height={1150}
              className="opacity-55"
            />
          </div>
        )}
        {isActiveFileText && (
          <CodeEditor
            filename={activeFile.name}
            key={activeFile._id}
            initialValue={activeFile.content}
            onChange={(content: string) => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              timeoutRef.current = setTimeout(() => {
                updateFile({
                  id: activeFile._id,
                  content,
                });
              }, DEBOUNCE_TIME);
            }}
          />
        )}

        {isActiveFileBinary && <p>TODO: Binary file</p>}
      </div>
    </div>
  );
};

import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { getItemPadding } from "@/features/projects/components/file-explorer/constansts";
import { CreateInput } from "@/features/projects/components/file-explorer/create-input";
import { LoadingRow } from "@/features/projects/components/file-explorer/loading-row";
import { RenameInput } from "@/features/projects/components/file-explorer/rename-input";
import { TreeItemWrapper } from "@/features/projects/components/file-explorer/tree-item-wrapper";
import {
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useFolderContents,
  useRenameFile,
} from "@/features/projects/hooks/use-fles";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

interface TreeProps {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
}

export const Tree = ({ item, level = 0, projectId }: TreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === "folder" && isOpen,
  });

  const handleRename = (newName: string) => {
    setIsRenaming(false);

    if (newName === item.name) {
      return;
    }

    renameFile({
      id: item._id,
      newName,
    });
  };

  const handleCreate = (name: string) => {
    setCreating(null);

    if (creating === "file") {
      createFile({
        projectId,
        name,
        content: "",
        parentId: item._id,
      });
    } else {
      createFolder({
        projectId,
        name,
        parentId: item._id,
      });
    }
  };

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true);
    setCreating(type);
  };

  if (item.type === "file") {
    const fileName = item.name;
    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={fileName}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }
    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={false}
        onClick={() => {}}
        onDoubleClick={() => {}}
        onRename={() => setIsRenaming(true)}
        onDelete={() => {
          deleteFile({
            id: item._id,
          });
        }}
      >
        <FileIcon autoAssign fileName={fileName} className="size-4" />
        <span className="text-xm truncate">{fileName}</span>
      </TreeItemWrapper>
    );
  }

  const folderName = item.name;
  const folderContentRender = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90",
          )}
        />
        <FolderIcon folderName={folderName} className="size-4" />
      </div>
      <span className="text-sm truncate">{folderName}</span>
    </>
  );

  if (creating) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group items-center gap-1 h-5.5 hover:bg-accent/30 cursor-pointer w-full"
          style={{
            paddingLeft: getItemPadding(level, false),
          }}
        >
          {folderContentRender}
        </button>
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
            {folderContents?.map((subItem) => (
              <Tree
                key={`${subItem._id}`}
                item={subItem}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }

  if (isRenaming) {
    return (
      <>
        <RenameInput
          type="folder"
          defaultValue={folderName}
          isOpen={isOpen}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
        {isOpen && (
          <>
            {folderContents === undefined && <LoadingRow level={level + 1} />}
            {folderContents?.map((subItem) => (
              <Tree
                key={`${subItem._id}`}
                item={subItem}
                level={level + 1}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </>
    );
  }
  return (
    <>
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={false}
        onClick={() => setIsOpen((prev) => !prev)}
        onDoubleClick={() => {}}
        onRename={() => {
          setIsRenaming(true);
        }}
        onDelete={() => {
          //TODO:close tab
          deleteFile({
            id: item._id,
          });
        }}
        onCreateFile={() => startCreating("file")}
        onCreateFolder={() => startCreating("folder")}
      >
        {folderContentRender}
      </TreeItemWrapper>
      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level + 1} />}
          {folderContents?.map((subItem) => (
            <Tree
              key={`${subItem._id}`}
              item={subItem}
              level={level + 1}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </>
  );
};

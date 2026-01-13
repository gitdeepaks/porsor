import { FileIcon } from "@react-symbols/icons/utils";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEditor } from "@/features/projects/hooks/use-editor";
import { useFilePath } from "@/features/projects/hooks/use-fles";
import type { Id } from "../../../../convex/_generated/dataModel";

interface FileBreadCrumbsProps {
  projectId: Id<"projects">;
}

const FileBreadCrumbs = ({ projectId }: FileBreadCrumbsProps) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId);

  if (filePath === undefined || !activeTabId)
    return (
      <div className="p-2 bg-background pl-4 border-b">
        <Breadcrumb>
          <BreadcrumbList className="sm:gap-0.5 gap-0.5">
            <BreadcrumbItem className="text-sm">
              <BreadcrumbPage>&nbsp;</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );

  return (
    <div className="p-2 bg-background pl-4 border-b overflow-x-auto">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap sm:gap-0.5 gap-0.5">
          {filePath.map((item, index) => {
            const isLast = index === filePath.length - 1;
            return (
              <React.Fragment key={item._id}>
                <BreadcrumbItem className="text-sm whitespace-nowrap">
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      <FileIcon
                        fileName={item.name}
                        autoAssign
                        className="size-4"
                      />
                      {item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="#">{item.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default FileBreadCrumbs;

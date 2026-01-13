import { useCallback } from "react";
import { useEditorStore } from "@/features/editor/hooks/store/use-editor-store";
import type { Id } from "../../../../convex/_generated/dataModel";

export const useEditor = (projectId: Id<"projects">) => {
  const store = useEditorStore();
  const tabStore = useEditorStore((state) => state.getTabState(projectId));

  const openFile = useCallback(
    (fileId: Id<"files">, options: { pinned: boolean }) => {
      store.openFile(projectId, fileId, options);
    },
    [projectId, store],
  );

  const closeTab = useCallback(
    (fileId: Id<"files">) => {
      store.closeTab(projectId, fileId);
    },
    [projectId, store],
  );

  const closeAllTabs = useCallback(() => {
    store.closeAllTabs(projectId);
  }, [projectId, store]);

  const setActiveTab = useCallback(
    (fileId: Id<"files">) => {
      store.setActiveTab(projectId, fileId);
    },
    [projectId, store],
  );

  return {
    openTabs: tabStore.openTabs,
    activeTabId: tabStore.activeTabId,
    previewTabId: tabStore.previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
};

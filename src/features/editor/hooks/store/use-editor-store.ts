import { create } from "zustand";

import type { Id } from "../../../../../convex/_generated/dataModel";

interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;

  getTabState: (projectId: Id<"projects">) => TabState;

  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean },
  ) => void;

  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  closeAllTabs: (projectId: Id<"projects">) => void;
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),
  getTabState: (projectId: Id<"projects">) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },
  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean },
  ) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, previewTabId } = state;
    const isOpen = openTabs.includes(fileId);
    const { pinned } = options;
    // Case1: Opening as preview - replace existing preview or activate existing tab
    if (isOpen && !pinned) {
      let newTabs: Id<"files">[];
      if (previewTabId && previewTabId !== fileId) {
        // Replace previewTabId with fileId, and remove fileId from its old position
        newTabs = openTabs
          .filter((id: Id<"files">) => id !== fileId) // Remove fileId if it exists elsewhere
          .map((id: Id<"files">) => (id === previewTabId ? fileId : id)); // Replace previewTabId
      } else {
        // File is already open (and is already the preview or no preview exists), just use existing tabs
        newTabs = openTabs;
      }

      tabs.set(projectId, {
        ...state,
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // Case2: Opening as immediatly as pinned - add new  tab

    if (!isOpen && pinned) {
      tabs.set(projectId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });
      set({ tabs });
      return;
    }
    // Case3: File is already open - just activate (and pin if double-clicked)
    const shouldPin = pinned && previewTabId === fileId;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
    set({ tabs });
  },
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;
    const tabIndex = openTabs.indexOf(fileId);
    if (tabIndex === -1) return;
    const newTabs = openTabs.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }
    tabs.set(projectId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
    set({ tabs });
  },
  closeAllTabs: (projectId: Id<"projects">) => {
    const tabs = new Map(get().tabs);
    tabs.set(projectId, defaultTabState);
    set({ tabs });
  },
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
    });
    set({ tabs });
  },
}));

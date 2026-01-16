import { indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { useEffect, useMemo, useRef } from "react";
import { customSetup } from "@/features/editor/extensions/custom-setup";
import { getLanguageExtension } from "@/features/editor/extensions/language-extention";
import { minimap } from "@/features/editor/extensions/miniman";
import { quickEdit } from "@/features/editor/extensions/quick-edit";
import { suggestion } from "@/features/editor/extensions/suggestion";
import { customTheme } from "@/features/editor/extensions/theme";
import { selectionTooltip } from "@/features/editor/extensions/selection-tooltip";

interface CodeEditorProps {
  filename: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({
  filename,
  initialValue = "",
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtention = useMemo(
    () => getLanguageExtension(filename),
    [filename],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!editorRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        oneDark,
        customTheme,
        customSetup,
        languageExtention,
        suggestion(filename),
        quickEdit(filename),
        selectionTooltip(),
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.view.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: we don't want to re-create the editor when the language extention changes
  }, [languageExtention]);
  return <div ref={editorRef} className="size-full pl-4 bg-background"></div>;
};

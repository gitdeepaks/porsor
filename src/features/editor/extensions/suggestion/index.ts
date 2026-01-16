import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  keymap,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";

import { fetcher } from "./fetcher";

const setSuggestionEffect = StateEffect.define<string | null>();

const suggestionState = StateField.define<string | null>({
  create: () => {
    return null;
  },

  update: (value, transaction) => {
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "suggestion";
    span.textContent = this.text;
    span.style.opacity = "0.4"; //Ghost text appearance
    span.style.pointerEvents = "none";
    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const DEBOUNCE_DELAY = 300;

let currentAbortController: AbortController | null = null;

// TODO: Delete this block this fake suggestion generator

const generatePayload = (view: EditorView, filename: string) => {
  const code = view.state.doc.toString();
  if (!code || code.trim() === "") {
    return null;
  }
  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);
  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];
  const previousLineTOFetch = Math.min(5, currentLine.number - 1);

  for (let i = previousLineTOFetch; i >= 1; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];
  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);
  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    filename,
    code,
    currentLine: currentLine.text,
    previousLines: previousLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
    nextLines: nextLines.join("\n"),
    lineNumber: currentLine.number,
  };
};

const createDebouncePlugin = (filename: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }
      triggerSuggestion(view: EditorView) {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }

        isWaitingForSuggestion = true;

        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, filename);

          if (!payload) {
            isWaitingForSuggestion = false;
            view.dispatch({
              effects: setSuggestionEffect.of(null),
            });
            return;
          }
          currentAbortController = new AbortController();
          const suggestion = await fetcher(
            payload,
            currentAbortController.signal,
          );

          isWaitingForSuggestion = false;
          view.dispatch({
            effects: [setSuggestionEffect.of(await suggestion)],
          });
        }, DEBOUNCE_DELAY);
      }
      destroy() {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }
        if (currentAbortController !== null) {
          currentAbortController.abort();
        }
      }
    },
  );
};

const renderPluigin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.build(view) as DecorationSet;
    }
    update(update: ViewUpdate) {
      // Rebuild the decorations if the doc is chhanged
      const suggestionChanged = update.transactions.some((transaction) => {
        return transaction.effects.some((effect) => {
          return effect.is(setSuggestionEffect);
        });
      });
      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view) as DecorationSet;
      }
    }

    build(view: EditorView) {
      if (isWaitingForSuggestion) {
        return Decoration.none;
      }
      // Get current suggestion from the state
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }
      // Create a widgest decoration at the cursor position
      const cursor = view.state.selection.main.head;
      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1,
        }).range(cursor),
      ]);
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false;
      }
      const cursor = view.state.selection.main.head;
      view.dispatch({
        changes: {
          from: cursor,
          insert: suggestion,
        },
        selection: {
          anchor: cursor + suggestion.length,
        },
        effects: [setSuggestionEffect.of(null)],
      });
      return true;
    },
  },
]);

export const suggestion = (filename: string) => [
  suggestionState,
  createDebouncePlugin(filename), //Trigger suggestion when the user types
  renderPluigin,
  acceptSuggestionKeymap,
];

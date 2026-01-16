import { type EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  EditorView,
  keymap,
  showTooltip,
  type Tooltip,
} from "@codemirror/view";
import { fetcher } from "./fetcher";

export const showQuickEditEffect = StateEffect.define<boolean>();

let editorView: EditorView | null = null;
let currentAbortController: AbortController | null = null;

export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },

  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return effect.value;
      }
    }
    if (transaction.selection) {
      const selection = transaction.state.selection.main;
      if (selection.empty) {
        return false;
      }
    }

    return value;
  },
});

const quickEditTooltip = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;
  if (selection.empty) {
    return [];
  }

  const isQuickEditActive = state.field(quickEditState, false);
  if (!isQuickEditActive) {
    return [];
  }

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      // biome-ignore lint/correctness/useExhaustiveDependencies: view parameter required by Tooltip interface but we use global editorView
      create(view: EditorView) {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

        const form = document.createElement("form");
        form.className = "flex flex-col gap-2";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Edit selected code";
        input.className = "bg-transparent outline-none px-2 font-sans w-full";
        input.autofocus = true;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex items-center justify-between gap-2";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
        cancelButton.onclick = () => {
          if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
          }
          if (editorView) {
            editorView.dispatch({
              effects: [showQuickEditEffect.of(false)],
            });
          }
        };
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit";
        submitButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

        form.onsubmit = async (e) => {
          e.preventDefault();
          if (!editorView) return;

          const instruction = input.value.trim();
          if (!instruction) return;

          const selection = editorView.state.selection.main;
          const selectedCode = editorView.state.doc.sliceString(
            selection.from,
            selection.to,
          );
          const fullCode = editorView.state.doc.toString();
          submitButton.disabled = true;
          submitButton.textContent = "Editing...";

          currentAbortController = new AbortController();
          const editCode = await fetcher(
            {
              selectedCode,
              fullCode,
              instruction,
            },
            currentAbortController.signal,
          );

          if (editCode) {
            editorView.dispatch({
              changes: {
                from: selection.from,
                to: selection.to,
                insert: editCode,
              },
              selection: {
                anchor: selection.from + editCode.length,
              },
              effects: [showQuickEditEffect.of(false)],
            });
          } else {
            submitButton.disabled = false;
            submitButton.textContent = "Submit";
          }
          currentAbortController = null;
        };
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitButton);

        form.appendChild(input);
        form.appendChild(buttonContainer);

        dom.appendChild(form);

        setTimeout(() => {
          input.focus();
        }, 0);

        return { dom };
      },
    },
  ];
};

const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return quickEditTooltip(state);
  },

  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return quickEditTooltip(transaction.state);
    }
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return quickEditTooltip(transaction.state);
      }
    }
    return tooltips;
  },
  provide: (field) =>
    showTooltip.computeN([field], (state) => state.field(field)),
});

const quickEditKeyMap = keymap.of([
  {
    key: "Mod-k",
    run: (view) => {
      const selection = view.state.selection.main;
      if (selection.empty) return false;

      view.dispatch({
        effects: showQuickEditEffect.of(true),
      });
      return true;
    },
  },
]);

const captureViewExtension = EditorView.updateListener.of((update) => {
  editorView = update.view;
});

export const quickEdit = (filename: string) => [
  quickEditState,
  quickEditTooltipField,
  quickEditKeyMap,
  captureViewExtension,
];

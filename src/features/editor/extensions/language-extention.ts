import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import type { Extension } from "@codemirror/state";

export const getLanguageExtension = (
  filename: string | undefined | null,
): Extension => {
  if (!filename) {
    return javascript();
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return javascript();
    case "ts":
      return javascript({ typescript: true });
    case "css":
      return css();
    case "go":
      return go();
    case "html":
      return html();
    case "json":
      return json();
    case "yaml":
      return yaml();
    case "markdown":
      return markdown();
    case "php":
      return php();
    case "python":
      return python();
    case "rust":
      return rust();
    case "sql":
      return sql();
    case "xml":
      return xml();
    case "md":
      return markdown();
    default:
      return javascript();
  }
};

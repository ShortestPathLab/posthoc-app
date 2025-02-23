import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import yamlWorker from "./yaml.worker?worker";
import * as monaco from "monaco-editor";

import { loader } from "@monaco-editor/react";
import { once } from "lodash";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (["css", "scss", "less"].includes(label)) {
      return new cssWorker();
    }
    if (["html", "handlebars", "razor"].includes(label)) {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    if (label === "yaml") return new yamlWorker();

    return new editorWorker();
  },
};

loader.config({ monaco });

export const load = once(() => loader.init());

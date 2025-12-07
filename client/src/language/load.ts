import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import * as monaco from "monaco-editor";

import { loader } from "@monaco-editor/react";
import { once } from "lodash-es";
import memoizee from "memoizee";

self.MonacoEnvironment = {
  getWorker: memoizee(
    (_, label) => {
      if (label === "json") {
        return new jsonWorker();
      }
      if (label === "typescript" || label === "javascript") {
        return new tsWorker();
      }
      if (label === "yaml") return new Worker("./yaml.worker");

      return new editorWorker();
    },
    { normalizer: ([, label]) => label },
  ),
};

loader.config({ monaco });

export const load = once(() => loader.init());

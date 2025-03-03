import { flatMap, isUndefined, join, map } from "lodash";
import {
  MarkerSeverity,
  type default as Monaco,
  Range,
  type editor,
} from "monaco-editor";
import { registerMarkerDataProvider } from "monaco-marker-data-provider";
import { configureMonacoYaml } from "monaco-yaml";
import { map as mapAsync } from "promise-tools";
import type { CompletionInfo, QuickInfo } from "typescript";
import { assert } from "utils/assert";
import { get } from "utils/set";
import { createFile, getInstance } from "./createFile";
import { getExpression, getExpressions } from "./expressions";
import { language } from "./language";
import { languageConfig } from "./languageConfig";
import posthocDts from "./posthoc.d.ts?raw";
import { schema } from "./schema";
import traceDts from "./trace.d.ts?raw";

async function generateDts(
  monaco: typeof Monaco,
  model: editor.ITextModel,
  id: string = "global"
) {
  createFile(monaco, model, `${id}-trace-dts`, traceDts, ".d.ts");
  createFile(monaco, model, `${id}-posthoc-dts`, posthocDts, ".d.ts");
}

const registered = new Map<typeof Monaco, () => void>();
const count = new Map<typeof Monaco, number>();

export const register = (monaco: typeof Monaco) => {
  if (registered.has(monaco)) {
    count.set(monaco, (count.get(monaco) ?? 0) + 1);
    return registered.get(monaco)!;
  }

  monaco.languages.register({ id: "typescript" });
  monaco.languages.register({ id: "yaml" });

  const yaml = configureMonacoYaml(monaco, {
    enableSchemaRequest: true,
    schemas: [
      {
        fileMatch: ["*"],
        schema,
        uri: "https://posthoc.pathfinding.ai/docs/search-trace",
      },
    ],
  });

  const tokensProvider = monaco.languages.setMonarchTokensProvider(
    "yaml",
    language
  );
  monaco.languages.setLanguageConfiguration("yaml", languageConfig(monaco));

  const completionItemKind = {
    const: monaco.languages.CompletionItemKind.Constant,
    var: monaco.languages.CompletionItemKind.Variable,
    keyword: monaco.languages.CompletionItemKind.Keyword,
    function: monaco.languages.CompletionItemKind.Function,
    module: monaco.languages.CompletionItemKind.Module,
    class: monaco.languages.CompletionItemKind.Class,
    property: monaco.languages.CompletionItemKind.Property,
    method: monaco.languages.CompletionItemKind.Method,
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    lib: ["esnext"],
  });

  const completionItemProvider =
    monaco.languages.registerCompletionItemProvider("yaml", {
      triggerCharacters: [".", "("],
      provideCompletionItems: async (model, position) => {
        const expr = getExpression(model, position);
        if (isUndefined(expr)) return { suggestions: [] };
        generateDts(monaco, model);
        const { uri, worker, dispose } = await getInstance(
          monaco,
          model,
          "completion",
          expr.match
        );
        const suggestions = (await worker.getCompletionsAtPosition(
          uri.toString(),
          expr.at + 1
        )) as CompletionInfo | undefined;
        assert(suggestions, "suggestions is defined");
        const word = model.getWordUntilPosition(position);
        dispose();
        return {
          suggestions: suggestions.entries.map((suggestion) => ({
            insertText: suggestion.name,
            sortText: suggestion.sortText,
            kind: get(
              completionItemKind,
              suggestion.kind as keyof typeof completionItemKind
            ),
            label: suggestion.name,
            range: new Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
          })),
        };
      },
    });

  const hoverProvider = monaco.languages.registerHoverProvider("yaml", {
    provideHover: async (model, position) => {
      const expr = getExpression(model, position);
      if (isUndefined(expr)) return { contents: [] };
      generateDts(monaco, model);
      const { worker, uri, dispose } = await getInstance(
        monaco,
        model,
        "hover",
        expr.match
      );
      const info = (await worker.getQuickInfoAtPosition(
        uri.toString(),
        expr.at + 1
      )) as QuickInfo | undefined;
      if (!info) return { contents: [] };
      dispose();
      return {
        contents: [
          {
            value: `\`\`\`ts\n${join(
              map(info.displayParts, "text"),
              ""
            )}\n\`\`\`\n${join(map(info.documentation, "text"), "\n")}`,
          },
        ],
      };
    },
  });

  const markerProvider = registerMarkerDataProvider(monaco, "yaml", {
    owner: "trace-expression-markers",
    provideMarkerData: async (model): Promise<editor.IMarkerData[]> => {
      const text = model.getValue();
      const allMatches = getExpressions(text);
      generateDts(monaco, model);
      const out = flatMap(
        await mapAsync(allMatches, async ({ value, line, column }) => {
          const { worker, uri, dispose } = await getInstance(
            monaco,
            model,
            "diagnostics",
            value
          );
          const a = await worker.getSyntacticDiagnostics(uri.toString());
          const b = await worker.getSemanticDiagnostics(uri.toString());
          const c = await worker.getSuggestionDiagnostics(uri.toString());
          dispose();
          return { diagnostics: [...a, ...b, ...c], line, column, value };
        }),
        ({ diagnostics, ...rest }) =>
          map(diagnostics, (d) => ({
            diagnostic: d,
            source: rest,
          }))
      );
      return map(out, ({ diagnostic, source }) => ({
        severity: MarkerSeverity.Error,
        message: `${diagnostic.messageText}`,
        code: `${diagnostic.code}`,
        startLineNumber: source.line,
        endLineNumber: source.line,
        startColumn: source.column + (diagnostic.start ?? 0),
        endColumn:
          source.column + (diagnostic.start ?? 0) + (diagnostic.length ?? 0),
      }));
    },
  });

  const dispose = () => {
    count.set(monaco, count.get(monaco) ?? 1 - 1);
    if (count.get(monaco)! > 0) return;
    registered.delete(monaco);
    yaml.dispose();
    [
      markerProvider,
      tokensProvider,
      completionItemProvider,
      hoverProvider,
    ].forEach((d) => d.dispose());
  };
  registered.set(monaco, dispose);
  return dispose;
};

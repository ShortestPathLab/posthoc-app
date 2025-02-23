import type { Monaco } from "@monaco-editor/react";
import { flatMap, isUndefined, join, last, map } from "lodash";
import {
  MarkerSeverity,
  Position,
  Range,
  type editor,
  type languages,
} from "monaco-editor";
import { registerMarkerDataProvider } from "monaco-marker-data-provider";
import { configureMonacoYaml, JSONSchema } from "monaco-yaml";
import { map as mapAsync } from "promise-tools";
import type { CompletionInfo, QuickInfo } from "typescript";
import { assert } from "utils/assert";
import { get } from "utils/set";
import rendererDefinitions from "./posthoc.d.ts?raw";
import definitions from "./trace.d.ts?raw";

export const language: languages.IMonarchLanguage = {
  tokenPostfix: ".yaml",

  brackets: [
    { token: "delimiter.template", open: "${{", close: "}}" },
    { token: "delimiter.bracket", open: "{", close: "}" },
    { token: "delimiter.square", open: "[", close: "]" },
  ],

  keywords: [
    "true",
    "True",
    "TRUE",
    "false",
    "False",
    "FALSE",
    "null",
    "Null",
    "Null",
    "~",
  ],

  numberInteger: /(?:0|[+-]?[0-9]+)/,
  numberFloat: /(?:0|[+-]?[0-9]+)(?:\.[0-9]+)?(?:e[-+][1-9][0-9]*)?/,
  numberOctal: /0o[0-7]+/,
  numberHex: /0x[0-9a-fA-F]+/,
  numberInfinity: /[+-]?\.(?:inf|Inf|INF)/,
  numberNaN: /\.(?:nan|Nan|NAN)/,
  numberDate:
    /\d{4}-\d\d-\d\d([Tt ]\d\d:\d\d:\d\d(\.\d+)?(( ?[+-]\d\d?(:\d\d)?)|Z)?)?/,

  escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,

  tokenizer: {
    root: [
      { include: "@whitespace" },
      { include: "@comment" },

      // Directive
      [/%[^ ]+.*$/, "meta.directive"],

      // Document Markers
      [/---/, "operators.directivesEnd"],
      [/\.{3}/, "operators.documentEnd"],

      // Block Structure Indicators
      [/[-?:](?= )/, "operators"],

      { include: "@anchor" },
      { include: "@tagHandle" },
      { include: "@flowCollections" },
      { include: "@blockStyle" },

      // Numbers
      [/@numberInteger(?![ \t]*\S+)/, "number"],
      [/@numberFloat(?![ \t]*\S+)/, "number.float"],
      [/@numberOctal(?![ \t]*\S+)/, "number.octal"],
      [/@numberHex(?![ \t]*\S+)/, "number.hex"],
      [/@numberInfinity(?![ \t]*\S+)/, "number.infinity"],
      [/@numberNaN(?![ \t]*\S+)/, "number.nan"],
      [/@numberDate(?![ \t]*\S+)/, "number.date"],

      // Key:Value pair
      [
        /(".*?"|'.*?'|[^#'"]*?)([ \t]*)(:)( |$)/,
        ["type", "white", "operators", "white"],
      ],

      { include: "@flowScalars" },
      [/^/, "string"],
      // String nodes
      [
        /.+?(?=(\s+#|$))/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": {
              token: "@rematch",
              next: "@templateString",
            },
          },
        },
      ],
    ],

    // Flow Collection: Flow Mapping
    object: [
      { include: "@whitespace" },
      { include: "@comment" },

      // Flow Mapping termination
      [/\}/, "@brackets", "@pop"],

      // Flow Mapping delimiter
      [/,/, "delimiter.comma"],

      // Flow Mapping Key:Value delimiter
      [/:(?= )/, "operators"],

      // Flow Mapping Key:Value key
      [/(?:".*?"|'.*?'|[^,{[]+?)(?=: )/, "type"],

      // Start Flow Style
      { include: "@flowCollections" },
      { include: "@flowScalars" },

      // Scalar Data types
      { include: "@tagHandle" },
      { include: "@anchor" },
      { include: "@flowNumber" },

      // Other value (keyword or string)
      [
        /[^},]+/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": {
              token: "string",
              next: "@templateStringInObject",
            },
          },
        },
      ],
    ],

    templateStringBase: [
      [
        /\$\{\{/,
        {
          token: "delimiter.template",
          next: "@javascript",
          nextEmbedded: "text/javascript",
        },
      ],
    ],

    templateStringInArray: [
      { include: "@templateStringBase" },
      [/]/, { token: "@rematch", next: "@pop" }],
      [/,/, { token: "@rematch", next: "@pop" }],
      [/^/, { token: "string", next: "@pop" }],
      [/./, "string"],
    ],

    templateStringInObject: [
      { include: "@templateStringBase" },
      [/}/, { token: "@rematch", next: "@pop" }],
      [/,/, { token: "@rematch", next: "@pop" }],
      [/^/, { token: "string", next: "@pop" }],
      [/./, "string"],
    ],

    templateString: [
      { include: "@templateStringBase" },
      [/#(.*)/, { token: "comment", next: "@pop" }],
      [/^/, { token: "string", next: "@pop" }],
      [/./, "string"],
    ],

    templateStringQuoted: [
      { include: "@templateStringBase" },
      [/'/, { token: "string", next: "@pop" }],
      [/./, "string"],
    ],

    templateStringDoubleQuoted: [
      { include: "@templateStringBase" },
      [/"/, { token: "string", next: "@pop" }],
      [/./, "string"],
    ],

    javascript: [
      [
        /\}\}/,
        { token: "delimiter.template", next: "@pop", nextEmbedded: "@pop" },
      ],
    ],

    // Flow Collection: Flow Sequence
    array: [
      { include: "@whitespace" },
      { include: "@comment" },

      // Flow Sequence termination
      [/\]/, "@brackets", "@pop"],

      // Flow Sequence delimiter
      [/,/, "delimiter.comma"],

      // Start Flow Style
      { include: "@flowCollections" },
      { include: "@flowScalars" },

      // Scalar Data types
      { include: "@tagHandle" },
      { include: "@anchor" },
      { include: "@flowNumber" },

      // Other value (keyword or string)
      [
        /[^\],]+/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": {
              token: "string",
              next: "@templateStringInArray",
            },
          },
        },
      ],
    ],

    // First line of a Block Style
    multiString: [
      [
        /^( +)(?=.+$)/,
        { token: "string-multiline-header", next: "@multiStringFirst.$1" },
      ],
    ],
    multiStringFirst: [
      { include: "@templateStringBase" },
      [
        /^/,
        { token: "string-multiline-first", next: "@multiStringContinued.$S2" },
      ],
      [/./, "string"],
    ],
    // Further lines of a Block Style
    //   Workaround for indentation detection
    multiStringContinued: [
      [
        /^( +)(?=.+$)/,
        {
          cases: {
            "$1==$S2": {
              token: "string-multiline-continue",
              next: "@templateString",
            },
            "@default": {
              token: "@rematch",
              next: "@popall",
            },
          },
        },
      ],
    ],

    whitespace: [[/[ \t\r\n]+/, "white"]],

    // Only line comments
    comment: [[/#.*$/, "comment"]],

    // Start Flow Collections
    flowCollections: [
      [/\[/, "@brackets", "@array"],
      [/\{/, "@brackets", "@object"],
    ],

    // Start Flow Scalars (quoted strings)
    flowScalars: [
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [
        /'/,
        {
          token: "string",
          next: "@templateStringQuoted",
        },
      ],
      [
        /"/,
        {
          token: "string",
          next: "@templateStringDoubleQuoted",
        },
      ],
      [/#(.*)/, { token: "comment", next: "@pop" }],
    ],

    doubleQuotedString: [
      [/[^\\"]+/, "string"],
      [/@escapes/, "string.escape"],
      [/\\./, "string.escape.invalid"],
      [/"/, "string", "@pop"],
    ],

    // Start Block Scalar
    blockStyle: [[/[>|][0-9]*[+-]?$/, "operators", "@multiString"]],

    // Numbers in Flow Collections (terminate with ,]})
    flowNumber: [
      [/@numberInteger(?=[ \t]*[,\]}])/, "number"],
      [/@numberFloat(?=[ \t]*[,\]}])/, "number.float"],
      [/@numberOctal(?=[ \t]*[,\]}])/, "number.octal"],
      [/@numberHex(?=[ \t]*[,\]}])/, "number.hex"],
      [/@numberInfinity(?=[ \t]*[,\]}])/, "number.infinity"],
      [/@numberNaN(?=[ \t]*[,\]}])/, "number.nan"],
      [/@numberDate(?=[ \t]*[,\]}])/, "number.date"],
    ],

    tagHandle: [[/![^ ]*/, "tag"]],

    anchor: [[/[&*][^ ]+/, "namespace"]],
  },
};

function matchCurrentExpression(model: editor.ITextModel, position: Position) {
  const preRange = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endColumn: position.column,
    endLineNumber: position.lineNumber,
  });
  const pre = preRange.match(/\$\{\{((?:(?!\}\})[\s\S])*)$/);
  if (pre && pre.length > 1) {
    const postRange = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: 9999,
      endLineNumber: 9999,
    });
    const post = postRange.match(/^([\s\S]*?)\s*(?=\}\})/);
    if (post && pre.length > 1) {
      return {
        match: `${last(pre)}${post[1]}`,
        at: last(pre)!.length,
      };
    }
    return { match: last(pre)!, at: last(pre)!.length };
  }
  return undefined;
}

function createFile(
  monaco: Monaco,
  model: editor.ITextModel,
  id: string,
  contents: string,
  extension: string = ".ts"
) {
  const uri = monaco.Uri.file(`${model.uri.path}-${id}${extension}`);
  (
    monaco.editor.getModel(uri) ??
    monaco.editor.createModel("", "typescript", uri)
  ).setValue(contents);
  return uri;
}
async function getInstance(
  monaco: Monaco,
  model: editor.ITextModel,
  id: string,
  contents: string
) {
  const uri = createFile(monaco, model, id, contents);
  const worker = await (
    await monaco.languages.typescript.getTypeScriptWorker()
  )(uri);
  return {
    uri,
    worker,
    dispose: () => monaco.editor.getModel(uri)?.setValue?.(""),
  };
}
function findBracketedValues(
  text: string
): { value: string; line: number; column: number }[] {
  const matches: { value: string; line: number; column: number }[] = [];
  const regex = /\$\{\{(.*?)\}\}/g;
  const lines = text.split(/\r?\n/);

  lines.forEach((line, lineIndex) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      matches.push({
        value: match[1],
        line: lineIndex + 1, // Convert to 1-based index
        column: match.index + 3 + 1, // Convert to 1-based index
      });
    }
  });

  return matches;
}
async function generateDefinitions(
  monaco: Monaco,
  model: editor.ITextModel,
  id: string = "global"
) {
  createFile(monaco, model, `${id}-definitions`, definitions, ".d.ts");
  // TODO: Decouple
  createFile(
    monaco,
    model,
    `${id}-d2-renderer-definitions`,
    rendererDefinitions,
    ".d.ts"
  );
}

const schema: JSONSchema = {
  definitions: {
    view: {
      type: "object",
      /**
       * Intrinsic properties
       */
      properties: {
        $: {
          type: "string",
          description:
            "The view type. This must either be one of the views defined here or a primitive.",
        },
        type: {
          markdownDescription:
            "The `type` property should succinctly represent the kind of event that was recorded. It's used everywhere in Posthoc's UI to identify events.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#type)",
        },
        clear: {
          type: ["string", "boolean"],
          markdownDescription:
            "Control when elements should be cleared.\n\n - `false`: Event remains visible until the end of the search trace.\n - `true`: Event clears immediately after the step they're drawn.\n - `string`: Event remains visible until another event of the same `id`, and the specified type (e.g. `close`), is encountered. This can also be an expression that evaluates to a string.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#clear)",
        },
        $if: {
          type: ["string", "boolean"],
          markdownDescription:
            "Conditionally render a view. This property is only evaluated at the time of the event.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#if)",
        },
        $for: {
          type: "object",
          markdownDescription:
            "Repeat a view based on a value. This property is only evaluated at the time of the event.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#for)",
        },
        $info: {
          type: "object",
          markdownDescription:
            "By default, clicking on elements in the viewport will show you info about the event that rendered it. However, you can define information that will only be shown when a specific part of the event was clicked.\n\n[Docs](https://posthoc.pathfinding.ai/docs/search-trace#info)",
        },
      },
      patternProperties: {
        "^(.+)$": {
          description: "View property.",
        },
      },
    },
  },
  type: "object",
  required: ["version", "views", "events"],
  properties: {
    version: {
      type: "string",
      enum: ["1.4.0"],
      markdownDescription:
        "The search trace version. This value dictates whether the legacy or the modern parser is used. Currently, versions below `1.4.0` will use the legacy parser. The legacy format also has no intellisense support.",
    },
    views: {
      type: "object",
      description:
        "Define custom visualisations for your data. Here, you can write custom views that define how your events translate to renderable objects.",
      properties: {
        main: {
          type: "array",
          items: { $ref: "#/definitions/view" },
          description:
            "Main view. A view is a reusable component that defines how to translate some event to renderable objects. This view is also the entry point to your visualisation.",
        },
      },
      patternProperties: {
        "^(.+)$": {
          type: "array",
          items: { $ref: "#/definitions/view" },
          description:
            "View. A view is a reusable component that defines how to translate some event to renderable objects.",
        },
      },
    },
    events: {
      type: "array",
      items: { type: "object" },
      description: "Your recorded data.",
    },
  },
};

export const register = (monaco: Monaco) => {
  monaco.languages.register({ id: "typescript" });
  monaco.languages.register({ id: "yaml" });

  monaco.languages.setLanguageConfiguration("yaml", {
    comments: {
      lineComment: "#",
    },
    brackets: [
      ["${{", "}}"],
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "${{", close: "}}" },
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    folding: {
      offSide: true,
    },
    onEnterRules: [
      {
        beforeText: /:\s*$/,
        action: {
          indentAction: monaco.languages.IndentAction.Indent,
        },
      },
    ],
  });
  const tokensProvider = monaco.languages.setMonarchTokensProvider(
    "yaml",
    language
  );

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
        const expr = matchCurrentExpression(model, position);
        if (isUndefined(expr)) return { suggestions: [] };
        generateDefinitions(monaco, model);
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
      const expr = matchCurrentExpression(model, position);
      if (isUndefined(expr)) return { contents: [] };
      generateDefinitions(monaco, model);
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
      const allMatches = findBracketedValues(text);
      generateDefinitions(monaco, model);
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

  return () => {
    yaml.dispose();
    [
      markerProvider,
      tokensProvider,
      completionItemProvider,
      hoverProvider,
    ].forEach((d) => d.dispose());
  };
};

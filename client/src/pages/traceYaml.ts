import type { Monaco } from "@monaco-editor/react";
import { isUndefined, last } from "lodash";
import { editor, Position, Range, type languages } from "monaco-editor";
import type { CompletionInfo } from "typescript";
import { assert } from "utils/assert";
import { get } from "utils/set";

export const language: languages.IMonarchLanguage = {
  tokenPostfix: ".yaml-js",

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
      [/^/, { token: "string", next: "@pop" }],
      [/#(.*)^/, { token: "comment", next: "@pop" }],
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
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endColumn: position.column,
    endLineNumber: position.lineNumber,
  });
  const pre = preRange.match(/\$\{\{(.*)/);
  if (pre && pre.length > 1) {
    const postRange = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: 9999,
      endLineNumber: position.lineNumber,
    });
    const post = postRange.match(/(.*)\}\}/);
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
export const register = (monaco: Monaco) => {
  monaco.languages.register({ id: "typescript" });
  monaco.languages.register({ id: "yaml-js" });
  monaco.languages.setLanguageConfiguration("yaml-js", {
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
    "yaml-js",
    language
  );

  const completionItemKind = {
    const: monaco.languages.CompletionItemKind.Constant,
    var: monaco.languages.CompletionItemKind.Variable,
    keyword: monaco.languages.CompletionItemKind.Keyword,
    function: monaco.languages.CompletionItemKind.Function,
    module: monaco.languages.CompletionItemKind.Module,
    class: monaco.languages.CompletionItemKind.Class,
    method: monaco.languages.CompletionItemKind.Method,
  };

  const completionItemProvider =
    monaco.languages.registerCompletionItemProvider("yaml-js", {
      triggerCharacters: [".", "("],
      provideCompletionItems: async (model, position) => {
        const expr = matchCurrentExpression(model, position);
        if (isUndefined(expr)) return { suggestions: [] };
        const uri = monaco.Uri.file(`${model.uri.path}.ts`);
        (
          monaco.editor.getModel(uri) ??
          monaco.editor.createModel("", "typescript", uri)
        ).setValue(expr.match);
        const worker = await (
          await monaco.languages.typescript.getTypeScriptWorker()
        )(uri);
        const suggestions = (await worker.getCompletionsAtPosition(
          uri.toString(),
          expr.at + 1
        )) as CompletionInfo | undefined;
        assert(suggestions, "suggestions is defined");

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
              position.column,
              position.lineNumber,
              position.column
            ),
          })),
        };
      },
    });
  return () =>
    [tokensProvider, completionItemProvider].forEach((d) => d.dispose());
};

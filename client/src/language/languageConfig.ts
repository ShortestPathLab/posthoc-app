import type { default as Monaco, languages } from "monaco-editor";

export const languageConfig = (
  monaco: typeof Monaco
): languages.LanguageConfiguration => {
  return {
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
  };
};

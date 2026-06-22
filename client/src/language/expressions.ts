import { last } from "es-toolkit";
import { flatMap, map } from "es-toolkit/compat";
import { type editor, Position } from "monaco-editor";
import { flow } from "utils/flow";

export function getExpression(model: editor.ITextModel, position: Position) {
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

export function getExpressions(text: string): { value: string; line: number; column: number }[] {
  return flow(text.split(/\r?\n/), (lines) =>
    flatMap(lines, (line, lineIndex) =>
      map([...line.matchAll(/\$\{\{(.*?)\}\}/g)], (match) => ({
        value: match[1],
        line: lineIndex + 1, // Convert to 1-based index
        column: match.index! + 3 + 1, // Convert to 1-based index
      })),
    ),
  );
}

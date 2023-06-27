import { join } from "lodash";
import {
  evaluateParsedString as evaluateTemplate,
  parseStringTemplateGenerator as makeParser,
} from "string-template-parser";
import { Prop } from "./Context";
import { parseToken } from "./parseToken";

const openBrace = /^\{\{\s*/;
const closeBrace = /^\s*\}\}/;
const neverMatch = /\b\B/;

export function parseString(str: string): Prop<any> {
  const parser = makeParser({
    VARIABLE_START: openBrace,
    VARIABLE_END: closeBrace,
    PIPE_START: neverMatch,
    PIPE_PARAMETER_START: neverMatch,
    QUOTED_STRING: neverMatch,
  });
  const parsed = parser(str);
  return join(parsed.literals, "")
    ? (ctx) => evaluateTemplate(parsed, {}, {}, (v) => parseToken(v)(ctx))
    : parseToken(parsed.variables[0].name);
}

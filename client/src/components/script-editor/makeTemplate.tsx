import { chunk } from "es-toolkit";
import { join, map, split } from "es-toolkit/compat";
import { FunctionTemplate } from "./FunctionTemplate";

type GenericFunctionTemplate = FunctionTemplate<[...any], any>;

function makeTypeString({ returnType, params }: GenericFunctionTemplate) {
  return `@type {(${join(
    map(params, (p) => `${p.name}: ${p.type}`),
    ", ",
  )}) => ${returnType}}`;
}

function makeComment(method: GenericFunctionTemplate) {
  const [open, prefix, close] = ["/**", " * ", " */"];
  const chunks = map(chunk(split(method.description, " "), 9), (c) => join(c, " "));
  return join(
    [open, ...map(chunks, (c) => `${prefix}${c}`), `${prefix}${makeTypeString(method)}`, close],
    "\n",
  );
}

function makeBody({ name, params, defaultReturnValue }: GenericFunctionTemplate) {
  return join(
    [
      `function ${name}(${join(map(params, "name"), ", ")}) {`,
      `    return ${JSON.stringify(defaultReturnValue)};`,
      `}`,
    ],
    "\n",
  );
}

export function makeTemplate(methods?: GenericFunctionTemplate[]) {
  return join(
    map(methods, (m) => join([makeComment(m), makeBody(m)], "\n")),
    "\n\n",
  );
}

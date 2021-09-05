import { transpile } from "./transpile";
import Interpreter from "js-interpreter";
import { map } from "lodash";
import { templates } from "./templates";
import { FunctionTemplate } from "./FunctionTemplate";

const TIMEOUT = 1000;

type TemplateMap = typeof templates;

type Key = keyof TemplateMap;

type ReturnTypeOf<T extends Key> = TemplateMap[T] extends FunctionTemplate<
  [...any],
  infer R
>
  ? R
  : never;

type ParamsOf<T extends Key> = TemplateMap[T] extends FunctionTemplate<
  infer R,
  any
>
  ? R
  : [];

export async function call<T extends Key>(
  script: string,
  method: T,
  params: ParamsOf<T>,
  es6: boolean = true,
  fast: boolean = false
): Promise<ReturnTypeOf<T> | undefined> {
  return fast
    ? UNSTABLE_evaluate(script, method, params)
    : await interpret(script, method, params, es6);
}

export function UNSTABLE_evaluate<T extends Key>(
  script: string,
  method: T,
  params: ParamsOf<T>
) {
  return eval(`${script}\n${makeCallExpression(method, params)}`);
}

export async function interpret<T extends Key>(
  script: string,
  method: T,
  params: ParamsOf<T>,
  es6: boolean = true
): Promise<ReturnTypeOf<T> | undefined> {
  const code = es6 ? transpile(script) : script;
  if (code) {
    const interpreter = new Interpreter(code);
    interpreter.appendCode(makeCallExpression(method, params));
    return new Promise((res) => {
      const start = Date.now();
      const step = () => {
        const active = Date.now() - start <= TIMEOUT;
        if (active && interpreter.step()) {
          requestAnimationFrame(step);
        } else {
          res(interpreter.value);
        }
      };
      step();
    });
  }
}

function makeCallExpression<T extends Key>(method: T, params: ParamsOf<T>) {
  return `${method}(${map(params, JSON.stringify).join(", ")});`;
}

import memo from "memoizee";
import { FunctionTemplate } from "./FunctionTemplate";
import { templates } from "./templates";

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

const fn = memo(
  (script: string, method: string) =>
    // eslint-disable-next-line no-new-func
    new Function(
      "params",
      `${script}; return ${method}.apply(null, params);`
    ) as (params: any[]) => any
);

export function call<T extends Key>(
  script: string,
  method: T,
  params: ParamsOf<T>
): ReturnTypeOf<T> {
  try {
    return fn(script, method)(params);
  } catch {
    return templates[method].defaultReturnValue as ReturnTypeOf<T>;
  }
}

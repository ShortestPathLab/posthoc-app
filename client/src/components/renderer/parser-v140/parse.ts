import { Dictionary as Dict, flatMap, map, mapValues, range } from "lodash";
import {
  CompiledComponent,
  ComponentDefinition,
  ComponentDefinitionMap,
  IntrinsicComponentMap,
  TraceComponent,
} from "protocol";
import { Context } from "./Context";
import { applyScope } from "./applyScope";
import { mapProperties } from "./mapProperties";
import { normalize } from "./normalize";
import { parseProperty } from "./parseProperty";

function transformOne(component: TraceComponent<string, Dict<any>>) {
  const { $for, $if, ...rest } = component;
  if ($for || $if) {
    const { $let = "i", $from = 0, $to = 1, $step = 1 } = $for ?? {};
    const condition = parseProperty($if);
    const from = parseProperty($from);
    const to = parseProperty($to);
    const step = parseProperty($step);
    return ($: Context = {}) =>
      !$if || condition($)
        ? range(from($), to($), step($)).map((i) => {
            const scoped = applyScope($, normalize({ [$let]: i }));
            return applyScope(scoped, normalize(rest as any));
          })
        : [];
  } else {
    return ($: Context = {}) => {
      const scoped = applyScope($, normalize(rest as any));
      return [scoped];
    };
  }
}

type Compiled<T extends string> = (
  context: Context
) => Compiled<T>[] | CompiledComponent<T, Dict<any>>[];

/**
 * A parser for a list of Components
 * @param definition a list of Components
 * @param context user injected context (from parent Components)
 * @returns a list of parsed Components
 */
export function parse<T extends IntrinsicComponentMap>(
  definition: ComponentDefinition<string, Dict<any>>,
  components: ComponentDefinitionMap
): (
  context: Context
) => CompiledComponent<Extract<keyof T, string>, Record<string, any>>[] {
  const parseOne = (element: TraceComponent<string, Dict<any>>) => {
    const { $ } = element;
    const scoped = transformOne(element);
    return $ in components
      ? (context: Context) =>
          flatMap(scoped(context), (elem) => flatMap(store[$], (f) => f(elem)))
      : (context: Context) =>
          map(scoped(context), (elem) =>
            Object.setPrototypeOf(
              mapProperties(elem, (prop) => prop(elem)),
              null
            )
          );
  };
  const store: Dict<Compiled<Extract<keyof T, string>>[]> = mapValues(
    components,
    (elements) => map(elements, parseOne)
  );
  const entry = flatMap(definition, parseOne);
  return (context) => flatMap(entry, (e) => e(context));
}

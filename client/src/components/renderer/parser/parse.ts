import { Dictionary as Dict, range } from "lodash";
import {
  ComponentDefinition,
  ComponentDefinitionMap,
  IntrinsicComponentMap,
  ParsedComponent,
  ParsedComponentDefinition,
  TraceComponent,
} from "protocol";
import { Context, Key } from "./Context";
import { applyScope } from "./applyScope";
import { normalize, normalizeConstant } from "./normalize";

function parseFor(component: TraceComponent<string, Dict<any>>) {
  const { $for, ...rest } = component;
  if ($for) {
    const { $let = "i", $from = 0, $to = 1, $step = 1 } = $for;
    return range($from, $to, $step).map((i) =>
      applyScope(normalizeConstant({ [$let]: i }), normalize(rest as any))
    );
  } else {
    return [component];
  }
}

/**
 * A parser for a list of Components
 * @param definition a list of Components
 * @param context user injected context (from parent Components)
 * @returns a list of parsed Components
 */
export function parse<T extends IntrinsicComponentMap>(
  definition: ComponentDefinition<string, Dict<any>>,
  components: ComponentDefinitionMap,
  context: Context<T[Key<T>]> = {}
): ParsedComponentDefinition<T> {
  return definition.flatMap((c) => {
    const { $ } = c;
    const c2 = parseFor(c);
    return c2.flatMap((component) => {
      const scoped = applyScope(
        normalizeConstant(context),
        normalize(component)
      );
      return $ in components
        ? parse(components[$], components, scoped)
        : [scoped as ParsedComponent<Key<T>, T[Key<T>]>];
    });
  });
}

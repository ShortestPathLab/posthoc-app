import { Dictionary as Dict } from "lodash";
import { ComponentDefinition, ComponentDefinitionMap, IntrinsicComponentMap, ParsedComponent, ParsedComponentDefinition } from "protocol";
import { applyScope } from "./applyScope";
import { Context, Key } from "./Context";
import { normalize } from "./normalize";
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
  return definition.flatMap((component) => {
    const { $ } = component;
    const scoped = applyScope(normalize(context), normalize(component));
    return $ in components
      ? parse(components[$], components, scoped)
      : [scoped as ParsedComponent<Key<T>, T[Key<T>]>];
  });
}
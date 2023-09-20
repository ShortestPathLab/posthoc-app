import { keyBy } from "lodash";
import { NameMethodMap } from "protocol";
import { features } from "./methods/features";
import { general } from "./methods/general";
import { solve } from "./methods/solve";

const methods = keyBy(
  [...features, ...general, ...solve],
  "name"
) as unknown as {
  [K in keyof NameMethodMap]: NameMethodMap[K];
};

export async function call<T extends keyof NameMethodMap>(
  method: T,
  params: Parameters<NameMethodMap[T]["handler"]>
) {
  return await methods[method].handler(params);
}

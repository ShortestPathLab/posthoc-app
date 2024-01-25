import { NameMethodMap } from "protocol";

export function createMethod<T extends keyof NameMethodMap>(
  name: T,
  handler: NameMethodMap[T]["handler"]
) {
  return { name, handler };
}

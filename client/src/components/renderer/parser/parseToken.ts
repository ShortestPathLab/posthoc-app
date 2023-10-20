import { Prop } from "./Context";
import { normalize } from "./normalize";

export function parseToken(token: string): Prop<any> {
  const f = Function("ctx", `return ${token};`);
  return (ctx) =>
    f(
      new Proxy(normalize(ctx), {
        get(target, prop: string) {
          return target[prop]?.({});
        },
      })
    );
}

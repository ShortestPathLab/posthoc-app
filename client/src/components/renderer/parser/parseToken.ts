import { normalize } from "./normalize";
import { Prop } from "./Context";

export function parseToken(token: string): Prop<any> {
  const f = Function("ctx", `return ${token};`);
  return (ctx) =>
    f(
      new Proxy(normalize(ctx), {
        get(target, prop: string) {
          return target[prop]({});
        },
      })
    );
}

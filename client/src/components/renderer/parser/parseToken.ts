import { Prop } from "./Context";
import { normalize } from "./normalize";

export const parseToken = (token: string): Prop<any> => {
  const f = Function("$", `return ${token};`);
  return (ctx) =>
    f(
      new Proxy(normalize(ctx), {
        get(target, prop: string) {
          return typeof target?.[prop] === "function"
            ? target[prop]({})
            : target?.[prop];
        },
      })
    );
};

import memo from "memoizee";
import { Prop } from "./Context";
import { normalize } from "./normalize";

export const parseToken = memo(
  (token: string): Prop<any> => {
    const f = Function("$", `return ${token};`);
    return (ctx) =>
      f(
        new Proxy(normalize(ctx), {
          get(target, prop: string) {
            return target[prop]?.({});
          },
        })
      );
  },
  { primitive: true }
);

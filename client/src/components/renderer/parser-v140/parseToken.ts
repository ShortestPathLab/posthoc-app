import { Prop } from "./Context";
import { normalize } from "./normalize";

export const parseToken = (token: string): Prop<any> => {
  const f = Function(
    "$",
    `
      const theme = $.__internal__?.context.theme;
      const color = $.__internal__?.context.color;
      const step = $.__internal__?.step;
      const events = $.__internal__?.events;
      const parent = $.__internal__?.parent;
      return ${token};
  `
  );
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

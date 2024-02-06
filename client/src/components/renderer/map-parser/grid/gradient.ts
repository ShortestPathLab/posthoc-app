import { chain as _ } from "lodash";

export const gradient =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

export function getValue(char: string) {
  return _(gradient)
    .split("")
    .indexOf(char)
    .thru((n) => Math.max(n - 3, 0) / gradient.length)
    .value();
}

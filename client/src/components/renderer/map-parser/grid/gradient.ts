import { indexOf, split } from "lodash-es";
import { _ } from "utils/chain";

export const gradient =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

export function getValue(char: string) {
  return _(
    gradient,
    (v) => split(v, ""),
    (v) => indexOf(v, char),
    (n) => Math.max(n - 3, 0) / gradient.length
  );
}

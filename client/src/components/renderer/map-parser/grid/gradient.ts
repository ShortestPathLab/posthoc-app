import { indexOf, split } from "es-toolkit/compat";
import { flow } from "utils/flow";

export const gradient =
  " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

export function getValue(char: string) {
  return flow(
    gradient,
    (v) => split(v, ""),
    (v) => indexOf(v, char),
    (n) => Math.max(n - 3, 0) / gradient.length,
  );
}

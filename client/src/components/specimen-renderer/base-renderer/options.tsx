import { getColor } from "../colors";
import { NodeOptionsMapper as Options } from "../planar-renderer/Draw";

export const progressOptions: Options<"x" | "y"> = (
  { type, variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({ ...v, a: s?.to?.({ x, y }), color: getColor(type) });

export const shadowOptions: Options<"x" | "y"> = (
  { variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({ ...v, a: s?.to?.({ x, y }), color: 0xf1f1f1 });

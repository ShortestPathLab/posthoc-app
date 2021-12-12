import { blueGrey } from "@material-ui/core/colors";
import { getColor, hex } from "../colors";
import { scale } from "../planar/config";
import { NodeOptionsMapper as Options } from "../planar/Draw";
import { Structure } from "./Structure";

export const edgeColor = hex(blueGrey["100"]);
export const vertColor = hex(blueGrey["500"]);

export const edgeOptions: Options<Structure["edges"]> = (
  { variables: { x1 = 0, x2 = 0, y1 = 0, y2 = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x: x1, y: y1 }),
  b: s?.to?.({ x: x2, y: y2 }),
  color: edgeColor,
});

export const vertOptions: Options<Structure["verts"]> = (
  { variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x, y }),
  radius: 2 / scale,
  color: vertColor,
});

export const progressOptions: Options<"x" | "y"> = (
  { type, variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x, y }),
  color: getColor(type),
  radius: 2 / scale,
});

export const shadowOptions: Options<"x" | "y"> = (
  { variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x, y }),
  color: 0xf1f1f1,
  radius: 4 / scale,
});

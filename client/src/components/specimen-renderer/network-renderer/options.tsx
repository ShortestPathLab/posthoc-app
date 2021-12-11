import { blueGrey } from "@material-ui/core/colors";
import { hex } from "../colors";
import { scale } from "../planar-renderer/config";
import { NodeOptionsMapper as Options } from "../planar-renderer/Draw";
import { Nodes } from "./parse";

export const edgeColor = hex(blueGrey["100"]);
export const vertColor = hex(blueGrey["500"]);

export const edgeOptions: Options<Nodes["edges"]> = (
  { variables: { x1 = 0, x2 = 0, y1 = 0, y2 = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x: x1, y: y1 }),
  b: s?.to?.({ x: x2, y: y2 }),
  color: edgeColor,
});

export const vertOptions: Options<Nodes["verts"]> = (
  { variables: { x = 0, y = 0, ...v } = {} } = {},
  s
) => ({
  ...v,
  a: s?.to?.({ x, y }),
  radius: 2 / scale,
  color: vertColor,
});

import { Point } from "components/specimen-renderer/Renderer";
import { floor, map } from "lodash";
import { getColor } from "./colors";
import { scale } from "./config";
import { Node } from "./Node";

type OverlayProps = {
  start?: number;
  end?: number;
  size?: Point;
};
export function Overlay({
  start = 0,
  end = 0,
  size = { x: 0, y: 0 },
}: OverlayProps) {
  return (
    <>
      {map(
        [
          { color: getColor("source"), node: start },
          { color: getColor("destination"), node: end },
        ],
        ({ color, node }, i) => (
          <Node
            key={i}
            x={scale * (node % size.x)}
            y={scale * floor(node / size.x)}
            color={color}
            alpha={0.25}
          />
        )
      )}
    </>
  );
}

import { Point } from "components/specimen-renderer/Renderer";
import { floor, map } from "lodash";
import { getColor } from "../colors";
import { Square } from "./Node";

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
          { color: getColor("destination"), node: end },
          { color: getColor("source"), node: start },
        ],
        ({ color, node }, i) => (
          <Square
            key={i}
            x={node % size.x}
            y={floor(node / size.x)}
            color={color}
          />
        )
      )}
    </>
  );
}

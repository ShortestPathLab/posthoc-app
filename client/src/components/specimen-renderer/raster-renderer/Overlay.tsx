import { Point } from "components/specimen-renderer/Renderer";
import { floor, map } from "lodash";
import { getColor } from "../colors";
import { Square } from "./Draw";

type OverlayProps = {
  start?: number;
  end?: number;
  size?: Point;
};
export function Overlay({ start, end, size = { x: 0, y: 0 } }: OverlayProps) {
  return (
    <>
      {map(
        [
          { color: getColor("destination"), node: end },
          { color: getColor("source"), node: start },
        ],
        ({ color, node }, i) =>
          node !== undefined && (
            <Square
              key={i}
              x={0.5 + (node % size.x)}
              y={0.5 + floor(node / size.x)}
              color={color}
            />
          )
      )}
    </>
  );
}

import { getColor } from "../colors";
import { MapInfo } from "../map-parser/MapInfo";
import { Square } from "../planar-renderer/Draw";
import { Point } from "../Renderer";
import { Transform } from "../Transform";

type OverlayProps = {
  map: MapInfo;
  transform: Transform<Point>;
  start?: number;
  end?: number;
};
export function Overlay({
  start,
  end,
  map: { pointOf },
  transform: { to },
}: OverlayProps) {
  return (
    <>
      {[
        { color: getColor("destination"), node: end },
        { color: getColor("source"), node: start },
      ].map(
        ({ color, node }, i) =>
          node !== undefined && (
            <Square
              {...to({ x: 0, y: 0, ...pointOf(node) })}
              key={i}
              color={color}
            />
          )
      )}
    </>
  );
}

import { getColor } from "../colors";
import { MapInfo } from "../map-parser/MapInfo";
import { Square } from "../planar-renderer/Draw";
import { Point } from "../Renderer";
import { Scale } from "../Scale";

type OverlayProps = {
  map?: MapInfo;
  scale?: Scale<Point>;
  start?: number;
  end?: number;
};
export function Overlay({ start, end, map, scale }: OverlayProps) {
  return (
    <>
      {[
        { color: getColor("destination"), node: end },
        { color: getColor("source"), node: start },
      ].map(
        ({ color, node }, i) =>
          node !== undefined && (
            <Square
              {...scale?.to?.({ x: 0, y: 0, ...map?.pointOf?.(node) })}
              key={i}
              color={color}
            />
          )
      )}
    </>
  );
}
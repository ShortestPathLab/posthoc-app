import { getColor } from "../colors";
import { MapInfo } from "../Parser";
import { scale } from "../planar/config";
import { Square } from "../planar/Draw";
import { Point } from "../Renderer";
import { Scale } from "../Scale";

type OverlayProps = {
  map?: MapInfo;
  scale?: Scale<Point>;
  start?: number;
  end?: number;
};
export function Overlay({ start, end, map, scale: s }: OverlayProps) {
  return (
    <>
      {[
        { color: getColor("destination"), node: end },
        { color: getColor("source"), node: start },
      ].map(
        ({ color, node }, i) =>
          node !== undefined && (
            <Square
              {...s?.to?.({ x: 0, y: 0, ...map?.pointOf?.(node) })}
              radius={2 / scale}
              key={i}
              color={color}
            />
          )
      )}
    </>
  );
}

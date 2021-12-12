import { getColor } from "../colors";
import { MapInfo } from "../Parser";
import { Square } from "../raster/Draw";
import { Scale } from "../Size";

type OverlayProps = {
  map?: MapInfo;
  scale?: Scale;
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

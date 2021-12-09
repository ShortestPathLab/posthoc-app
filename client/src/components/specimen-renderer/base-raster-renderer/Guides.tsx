import { ceil, floor, forEach, range } from "lodash";
import { MapInfo } from "../map-parser/MapInfo";
import { scale } from "../planar-renderer/config";
import { makeGraphic } from "../planar-renderer/makeGraphic";
import { Point } from "../Renderer";
import { Transform } from "../Transform";

const WEIGHT = 1 / scale;

type Props = {
  alpha?: number;
  grid?: number;
};

const Grid = makeGraphic<Props>(
  (g, { width = 0, height = 0, alpha = 1, grid = 5 }) => {
    g.clear();
    g.lineStyle(WEIGHT, 0x000000, alpha);
    forEach(range(grid, height, grid), (i) =>
      g.moveTo(0, i + WEIGHT / 2).lineTo(width, i + WEIGHT / 2)
    );
    forEach(range(grid, width, grid), (i) =>
      g.moveTo(i + WEIGHT / 2, 0).lineTo(i + WEIGHT / 2, height)
    );
  }
);

export function Guides({
  transform: { minX, minY, maxX, maxY, to },
  grid = 5,
  alpha,
}: Props & { map: MapInfo; transform: Transform<Point> }) {
  const a = to({ x: minX, y: minY });
  const b = to({ x: maxX, y: maxY });
  return (
    <Grid
      {...{ alpha, grid }}
      x={floor(a.x)}
      y={floor(a.y)}
      width={ceil((b.x - a.x) / grid) * grid}
      height={ceil((b.y - a.y) / grid) * grid}
    />
  );
}

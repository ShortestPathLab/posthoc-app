import { PathfindingTask } from "protocol/SolveTask";
import { ParamsOf } from "protocol/Message";
import { floor, join, last, map, split } from "lodash-es";

type Params = Pick<ParamsOf<PathfindingTask>, "start" | "end" | "mapURI">;

export function grid({ mapURI, start, end }: Params) {
  const [, h, w] = split(mapURI, "\n");
  const [width, height] = map([w, h], (d) => +last(split(d, " "))!);
  return (path: string) =>
    join(
      [
        "version 1",
        join(
          [
            0,
            // File path
            path,
            // Dimensions
            width,
            height,
            // Start coordinates
            start % width,
            floor(start / width),
            // End coordinates
            end % width,
            floor(end / width),
            // Check optimality
            0,
          ],
          " "
        ),
      ],
      "\n"
    );
}

import { floor, join, last, map, split } from "lodash-es";
import { ParamsOf } from "protocol/Message";
import { PathfindingTask } from "protocol/SolveTask";

type Params = Pick<ParamsOf<PathfindingTask>, "start" | "end">;

export function grid(m: string, { start, end }: Params) {
  const [, h, w] = split(m, "\n");
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

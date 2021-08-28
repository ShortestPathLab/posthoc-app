import { Method, Namespace, Response } from "./Message";

export type SolveTask<T extends string, Params = {}> = Namespace<
  "solve",
  T,
  Params
>;

export type PathfindingTask = SolveTask<
  "pathfinding",
  {
    mapURI: string;
    algorithm: string;
    mapType: string;
    /**
     * The index of the start node.
     */
    start: number;
    /**
     * The index of the end node.
     */
    end: number;
  }
>;

/**
 * TODO Create type definition for search trace.
 */
type SearchTrace = any;

export type SearchTraceResult = Response<SearchTrace>;

export type PathfindingTaskMethod = Method<PathfindingTask, SearchTraceResult>;

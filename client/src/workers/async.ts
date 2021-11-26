import { memoize as memo } from "lodash";
import { HashWorker } from ".";
import { usingWorkerTask } from "./usingWorker";

export const hashAsync = memo(usingWorkerTask<string, string>(HashWorker));

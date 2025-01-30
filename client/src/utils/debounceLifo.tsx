import { debounce } from "lodash";

/**
 * Creates a debounced version of an asynchronous function that ensures
 * the function is called with the latest set of arguments. When the
 * function is invoked while a previous invocation is still running,
 * it will schedule the latest invocation to run after the current one
 * completes, discarding any intermediate calls.
 *
 * @template T - The type of the function to debounce.
 * @param {T} f - The asynchronous function to debounce.
 * @returns {T} - A debounced version of the function.
 */
export function debounceLifo<T extends (...args: any[]) => Promise<any>>(
  f: T,
  wait: number = 1000
): T {
  let isRunning = false;
  let scheduledArgs: Parameters<T> | null = null;

  const h = debounce(f, wait);

  const g = async (...args: Parameters<T>): Promise<void> => {
    if (isRunning) {
      scheduledArgs = args;
      return;
    }
    isRunning = true;
    try {
      await h(...args);
    } finally {
      isRunning = false;
      if (scheduledArgs) {
        const argsToRun = scheduledArgs;
        scheduledArgs = null;
        g(...argsToRun);
      }
    }
  };

  return g as T;
}

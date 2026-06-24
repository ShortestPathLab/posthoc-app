import { QueryClient } from "@tanstack/react-query";

/**
 * The app-wide React Query client. Exported as a singleton so non-React /
 * imperative code (worker-backed data functions, registry parsers) can read
 * through the same cache the hooks use — `queryClient.fetchQuery(someQuery(...))`
 * dedupes in-flight work and serves cached results, replacing the hand-rolled
 * `memoizee` wrappers the data layer used to carry.
 */
export const queryClient = new QueryClient();

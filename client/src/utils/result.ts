export async function resultAsync<A, E>(
  f: () => Promise<A>
): Promise<{ result: A; error?: never } | { error: E; result?: never }> {
  try {
    return { result: await f() };
  } catch (e) {
    return { error: e as E };
  }
}

export function result<A, E>(
  f: () => A
): { result: A; error?: never } | { error: E; result?: never } {
  try {
    return { result: f() };
  } catch (e) {
    return { error: e as E };
  }
}

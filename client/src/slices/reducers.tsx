export type Reducer<T, U = T> = (prev: T, next: U) => T;

export function replace<T>(_: unknown, next: T) {
  return next;
}

export function merge<T, U>(prev: T, next: U) {
  return { ...prev, ...next };
}

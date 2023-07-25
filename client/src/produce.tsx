export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = structuredClone(obj);
  f(b);
  return b;
}
export function produce2<T, U>(obj: T, f: (obj: T) => U) {
  return f(structuredClone(obj));
}

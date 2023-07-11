export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = structuredClone(obj);
  f(b);
  return b;
}

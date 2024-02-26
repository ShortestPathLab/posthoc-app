export function ext(s: string) {
  return s.split(".").pop()!;
}
export function name(s: string) {
  return s.split(".").shift();
}

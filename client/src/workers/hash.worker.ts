import md5 from "md5";

export function hash(value: string): string {
  return md5(value);
}

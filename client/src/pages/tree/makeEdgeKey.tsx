export function makeEdgeKey(
  id: string | number,
  pId: string | number | null | undefined
): string {
  return `${id}::${pId}`;
}

export function useCompatibilityLayer(query: string) {
  const node = document.querySelector(query);
  return () => node && (node as HTMLElement).click();
}

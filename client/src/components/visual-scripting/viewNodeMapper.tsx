import type { Node } from "@xyflow/react";
import { parseYamlAsync } from "workers/async";

// --- helpers ---------------------------------------------------------------

function stripEvents(raw: string): string {
  const m = raw.match(/^events\s*:\s*$/m);
  if (!m) return raw;
  return raw.slice(0, m.index!).trimEnd();
}


// Safe position fallback in a grid
function gridPos(i: number, cols = 4, gap = 220): { x: number; y: number } {
  const r = Math.floor(i / cols);
  const c = i % cols;
  return { x: c * gap, y: r * gap };
}

// --- main ------------------------------------------------------------------

export async function viewsToNodes(source: string): Promise<Node[]> {
  const head = stripEvents(source);

  const parsed: any = await parseYamlAsync({content: head});

  const nodes: Node[] = [];

  console.log(parsed);
  //TODO: convert parsed to nodes



  return nodes;
}
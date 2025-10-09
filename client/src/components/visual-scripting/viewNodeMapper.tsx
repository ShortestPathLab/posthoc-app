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

type ComponentItem = Record<string, any>;

const checkVersion = (a: string, b: string): boolean => {
  const parse = (s: string) => s.split('.').map(n => parseInt(n, 10) || 0);
  const [pa, pb] = [parse(a), parse(b)];

  const compare = (xs: number[], ys: number[]): number =>
    xs.length === 0 && ys.length === 0
      ? 0
      : (xs[0] ?? 0) !== (ys[0] ?? 0)
        ? (xs[0] ?? 0) - (ys[0] ?? 0)
        : compare(xs.slice(1), ys.slice(1));

  const diff = compare(pa, pb);
  return diff >= 0; 
};

// --- main ------------------------------------------------------------------
export async function viewsToNodes(source: string): Promise<Node[]> {
  const head = stripEvents(source);

  const parsed: any = await parseYamlAsync({content: head});

  const nodes: Node[] = [];

  const version = parsed.version ?? '';
  if (!version) {
    throw new Error(`Missing version`);
  }
  if (!checkVersion(version, '1.4.0')) {
    throw new Error(`Unsupported version ${version}, must be >= 1.4.0`);
  }

  const render = parsed.render;
  if (!render) throw new Error(`Missing render section`);

  // Iterate through components
  const componentsList = Object.entries(render.components);

  componentsList.map(([name, item], i) => {
    console.log("component", i, ':', name);


  });

  
  return nodes;
}

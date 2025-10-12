import { Edge, Node } from "@xyflow/react";
import ELK, {
  ElkExtendedEdge,
  ElkNode,
  LayoutOptions,
} from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions: LayoutOptions = {
  "elk.direction": "RIGHT",
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  o: LayoutOptions = {}
) => {
  const options: LayoutOptions = { ...o, ...elkOptions };
  const graph: ElkNode = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: "left",
      sourcePosition: "right",
    })),
    edges: edges as unknown as ElkExtendedEdge[],
  };

  const layoutedGraph = await elk.layout(graph);
  return {
    nodes: layoutedGraph.children?.map?.((node) => ({
      ...node,
      // React Flow expects a position property on the node instead of `x`
      // and `y` fields.
      position: { x: node.x, y: node.y },
    })) as Node[],

    edges: layoutedGraph.edges as unknown as Edge[],
  };
};

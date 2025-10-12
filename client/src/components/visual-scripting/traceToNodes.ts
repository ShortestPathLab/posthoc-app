import { Edge, Node } from "@xyflow/react";
import { parser } from "components/renderer/parser-v140/parseString";
import { chain, entries, mapValues } from "lodash-es";
import { TraceComponent } from "protocol/Trace-v140";
import { Properties } from "./flow";
import { getHeight } from "./FlowNode";
import {
  ComponentData,
  ContextData,
  ExpressionData,
  LoopData,
  resolveNodeConfig,
} from "./NodeConfigs";

const hasExpression = (s: string) => !!parser(s).variables.length;

/**
 * Somewhat dodgy trace to nodes function
 * Needs a serious rework after
 */
export const traceToNodes = (view: TraceComponent[]) => {
  const v = {
    nodes: [] as Node[],
    edges: [] as Edge[],
  };
  // Add component nodes
  view.forEach((n, i) => {
    v.nodes.push({
      id: `component.${i}`,
      type: "flow",
      position: {
        x: 0,
        y: 0,
      },
      width: 240,
      data: {
        type: "component",
        fields: mapValues(n, (v, k) =>
          hasExpression(v) ||
          // Special handling for $for
          k === "$for" ||
          // Special handling for $info
          k === "$info"
            ? undefined
            : v
        ),
        key: `${i}`,
      } as ComponentData,
    });
  });
  // Add expression nodes and edges
  chain(view)
    .flatMap((n, i) => entries(n).map(([k, v]) => [i, k, v] as const))
    // Don't want a property of "$"
    .filter(([, property]) => property !== "$")
    .groupBy(
      // Deduplicate by value
      // We just want one expression node per value
      ([, , value]) => value
    )
    .forEach((vs, i) => {
      const [, property, value] = vs[0];
      if (
        !hasExpression(value) &&
        property !== "$for" &&
        property !== "$info"
      ) {
        // Does not need nodes if a constant
        return;
      }
      if (property !== "$for") {
        v.edges.push({
          id: `expression.${i}`,
          source: `main`,
          target: `expression.${i}`,
        });
      }
      vs.forEach(([component, property], j) => {
        v.edges.push({
          id: `component.${i}.${j}`,
          source: `expression.${i}`,
          target: `component.${component}`,
          sourceHandle: "output",
          targetHandle: property,
        });
      });
      v.nodes.push({
        id: `expression.${i}`,
        type: "flow",
        position: {
          x: 0,
          y: 0,
        },
        width: 240,
        data:
          property === "$for"
            ? ({
                key: `expression.${i}`,
                type: "loop",
                fields: value,
              } as LoopData)
            : ({
                key: `expression.${i}`,
                type: "expression",
                fields: { property: value, type: "any" },
              } as ExpressionData),
      });
    })
    .value();
  // Add context
  v.nodes.push({
    id: `main`,
    type: "flow",
    position: {
      x: 0,
      y: 0,
    },
    width: 240,
    data: {
      type: "context",
    } as ContextData,
  });
  // Add viewport node
  v.nodes.push({
    id: `viewport`,
    type: "flow",
    position: {
      x: 280 * 6,
      y: 0,
    },
    width: 240,
    data: {
      type: "viewport",
    },
  });
  // Add viewport edges
  view.forEach((_, i) =>
    v.edges.push({
      id: `viewport.component.${i}`,
      source: `component.${i}`,
      target: `viewport`,
      sourceHandle: "result",
      targetHandle: "components",
    })
  );
  v.nodes.forEach((n) => {
    n.height = getHeight(
      resolveNodeConfig(n.data.type as string)(n.data.fields as Properties)
    );
  });
  return v;
};

import { useEffect, useMemo, useState } from "react";
import { MultiDirectedGraph } from "graphology";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { Trace } from "protocol";
import { TreeWorkerReturnType } from "./tree.worker";
import { chain, forOwn } from "lodash";
import { CameraState } from "sigma/types";

type TreeAxisProps = {
  tree?: TreeWorkerReturnType;
  trace?: Trace;
  selectedNode?: number;
  key?: string | undefined;
  cameraStatus?: CameraState;
};

export function TreeAxis(props: TreeAxisProps) {
  const { trace, tree, cameraStatus } = props;
  const loadGraph = useLoadGraph();
  const events = trace?.events;

  const sigma = useSigma();

  const graph = new MultiDirectedGraph();

  useMemo(() => {
    let previousNum: string = "";
    const yAxis = chain(tree).groupBy("y").value();
    const nodesData = chain(events)
      .map((c, i) => ({ step: i, id: c.id, pId: c.pId, g: c.g }))
      .groupBy("id")
      .value();

    forOwn(yAxis, (yNodes, num) => {
      const node = nodesData[yNodes[0].label][0];
      graph.addNode(num, {
        x: 0,
        y: Number(num),
        label: node.g,
        size: 4,
        color: "#ff0000",
      });
      if (previousNum) {
        graph.addEdgeWithKey(num, previousNum, num, { label: num });
      }
      previousNum = num;
    });
  }, [trace, events]);

  useEffect(() => {
    loadGraph(graph);
  }, [loadGraph, sigma]);

  useEffect(() => {
    sigma.getCamera().enable();
    if (cameraStatus) {
      sigma
        ?.getCamera()
        .setState({ y: cameraStatus.y, ratio: cameraStatus.ratio });
    }
    sigma.getCamera().disable();
  }, [sigma, cameraStatus]);
  return null;
}

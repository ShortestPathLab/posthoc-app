import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { chain, isUndefined, List, map } from "lodash";
import { sort } from "moderndash";
import { Trace } from "protocol";
import { useEffect, useRef, useState } from "react";
import { Coordinates } from "sigma/types";
import { TreeWorkerReturnType } from "./tree.worker";

type TreeAxisProps = {
  tree?: TreeWorkerReturnType;
  trace?: Trace;
  width?: number;
  height?: number;
};

export function TreeAxis(props: TreeAxisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width = 0, height = 0 } = props;
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  const graph = sigma.getGraph();
  const [tree, setTree] = useState<List<Coordinates>>([{ x: 0, y: 0 }]);

  useEffect(() => {
    function updateTree() {
      const nodes = graph.nodes();
      const updatedTree = map(nodes, (node: string) => {
        const displayData = sigma.getNodeDisplayData(node);
        const y = displayData?.y;
        let coordinates = { x: 0, y: 0 };
        if (!isUndefined(y)) {
          coordinates = sigma.framedGraphToViewport({ x: 0, y });
        }
        return coordinates;
      });
      setTree(updatedTree);
    }
    updateTree();

    registerEvents({
      beforeRender: () => {
        updateTree();
      },
    });
  }, [sigma]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width!, height!);

    const padding = 5;

    const yAxis = chain(tree).groupBy("y").value();
    console.log(tree);
    // const nodesData = chain(events)
    //   .map((c, i) => ({ step: i, id: c.id, pId: c.pId, g: c.g }))
    //   .groupBy("id")
    //   .value();

    const yAxisData = sort(
      Object.keys(yAxis).map((e) => Number(e)),
      { order: "asc" }
    );

    const maxY = Math.max(...yAxisData);
    const minY = Math.min(...yAxisData);

    ctx.beginPath();
    ctx.moveTo(5, minY);
    ctx.lineTo(5, maxY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let i = 0; i <= yAxisData.length; i++) {
      ctx.beginPath();
      ctx.moveTo(padding, yAxisData[i]);
      ctx.lineTo(padding + 5, yAxisData[i]);
      ctx.stroke();

      ctx.font = "10px Arial";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(yAxisData[i]?.toFixed(2), padding + 38, yAxisData[i]);
    }
  }, [sigma, tree, width, height]);

  return (
    <>
      <canvas
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        ref={canvasRef}
        width={width}
        height={height}
      ></canvas>
    </>
  );
}

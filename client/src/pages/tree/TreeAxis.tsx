import { useEffect, useRef, useState } from "react";
import { TreeWorkerReturnType } from "./tree.worker";
import { Trace } from "protocol";
import { CameraState, Coordinates } from "sigma/types";
import { chain, filter, forOwn, isUndefined, List, map } from "lodash";
import { sort } from "moderndash";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useThrottle } from "react-use";

type TreeAxisProps = {
  tree?: TreeWorkerReturnType;
  trace?: Trace;
  width?: number;
  height?: number;
  axisTrackingValue?: string;
};

type node = {
  x?: number;
  y?: number;
  id?: string | number;
  step?: number;
  f?: number;
  g?: number;
  [key: string]: any;
};

export function TreeAxis(props: TreeAxisProps) {
  const {
    width = 0,
    height = 0,
    trace,
    tree: orignalTree,
    axisTrackingValue,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const events = trace?.events;

  const registerEvents = useRegisterEvents();
  const [tree, setTree] = useState<List<node>>();
  const sigma = useSigma();
  const nodesData = chain(events)
    .map((c, i) => ({ step: i, id: c.id, pId: c.pId, g: c.g }))
    .groupBy("id")
    .value();

  useEffect(() => {
    function updateTree() {
      const updatedTree = map(orignalTree, ({ x, y, ...node }) => {
        return {
          ...nodesData[node.label][0],
          ...sigma.graphToViewport({ x, y }),
        };
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

    // check the ratio of camera
    const camera = sigma.getCamera();
    const { ratio } = camera.getState();
    const isSkip = Math.round(ratio);

    const yAxis = chain(tree).groupBy("y").value();

    const yAxisArray = sort(
      Object.keys(yAxis).map((e) => Number(e)),
      { order: "asc" }
    );
    let yAxisData = [];
    if (isSkip >= 1) {
      for (let i = 0; i < yAxisArray.length; ) {
        yAxisData.push(yAxisArray[i]);
        i += isSkip + 1;
      }
    } else {
      yAxisData = yAxisArray;
    }

    // g value
    const labelText: { [key: string]: [string, string] } = {};

    forOwn(yAxis, (value, key) => {
      const ave =
        value.reduce((acc, curr) => acc + (curr?.g ?? 0), 0) / value.length;
      const [coefficient, exp] = ave
        .toExponential(2)
        .split("e")
        .map((item) => +item);
      labelText[key] = [coefficient.toString(), exp.toString()];
    });
    const maxY = Math.max(...yAxisData);
    const minY = Math.min(...yAxisData);

    ctx.beginPath();
    ctx.moveTo(5, minY);
    ctx.lineTo(5, maxY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Y Axis: G Value", padding, height * 0.98);

    for (let i = 0; i <= yAxisData.length; i++) {
      ctx.beginPath();
      ctx.moveTo(padding, yAxisData[i]);
      ctx.lineTo(padding + 5, yAxisData[i]);
      ctx.stroke();

      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(labelText[yAxisData[i]]?.[0], padding + 5, yAxisData[i]);

      ctx.font = "8px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(
        labelText[yAxisData[i]]?.[1],
        padding + 25,
        yAxisData[i] - 4
      );
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

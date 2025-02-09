import { useTheme } from "@mui/material";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { chain, each, forOwn, groupBy, map, max, min } from "lodash";
import { sort } from "moderndash";
import { Trace } from "protocol";
import { useCallback, useEffect, useState } from "react";
import { TreeWorkerReturnType } from "./tree.worker";

const digits = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function numberToSuperscript(n: string | number): string {
  return `${n}`
    .split("")
    .map((digit) => digits[digit as keyof typeof digits])
    .join("");
}

type TreeAxisProps = {
  tree?: TreeWorkerReturnType;
  trace?: Trace;
  width?: number;
  height?: number;
  axisTrackingValue?: string;
};

type Node = {
  x?: number;
  y?: number;
  id?: string | number;
  step?: number;
  f?: number;
  g?: number;
  [key: string]: any;
};

export function TreeAxis(props: TreeAxisProps) {
  const theme = useTheme();
  const { width = 0, height = 0, trace, tree: originalTree } = props;
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const events = trace?.events;

  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  const drawAxis = useCallback(
    (tree: Node[]) => {
      const ctx = canvas?.getContext?.("2d");
      if (!ctx) return;

      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, width!, height!);

      const padding = 8;

      // check the ratio of camera
      const camera = sigma.getCamera();
      const { ratio } = camera.getState();
      const isSkip = Math.round(ratio);

      const yAxis = groupBy(tree, "y");

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
      const labelText: { [key: string]: [number, number] } = {};

      forOwn(yAxis, (value, key) => {
        const ave =
          value.reduce((acc, curr) => acc + (curr?.g ?? 0), 0) / value.length;
        const [coefficient, exp] = ave
          .toExponential(2)
          .split("e")
          .map((item) => +item);
        labelText[key] = [coefficient, exp];
      });
      const maxY = max(yAxisData)!;
      const minY = min(yAxisData)!;

      ctx.beginPath();
      ctx.moveTo(8, minY);
      ctx.lineTo(8, maxY);
      ctx.strokeStyle = theme.palette.text.secondary;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.palette.text.primary;
      ctx.font = "14px Inter";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText("Y Axis: G Value", padding, height * 0.98);

      each(yAxisData, (y) => {
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + 8, y);
        ctx.stroke();

        ctx.font = "12px Inter";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const [coefficient, exp] = labelText[y] ?? [];
        ctx.fillText(
          exp
            ? `g=${coefficient}×10${numberToSuperscript(exp)}`
            : `${coefficient}`,
          padding + 16,
          y
        );
      });
    },
    [sigma, width, height, theme, canvas]
  );

  useEffect(() => {
    const nodesData = chain(events)
      .map((c, i) => ({ step: i, id: c.id, pId: c.pId, g: c.g }))
      .groupBy("id")
      .value();

    function updateTree() {
      drawAxis(
        map(originalTree, ({ x, y, ...node }) => ({
          ...nodesData[node.label]?.[0],
          ...sigma.graphToViewport({ x, y }),
        }))
      );
    }
    updateTree();
    registerEvents({ afterRender: updateTree });
  }, [sigma, drawAxis, events]);

  return (
    <canvas
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
      }}
      ref={setCanvas}
      width={width * devicePixelRatio}
      height={height * devicePixelRatio}
    />
  );
}

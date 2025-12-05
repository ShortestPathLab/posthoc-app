import React, { useCallback, useEffect, useState } from "react";
import { ScatterPlotScaleAndData } from ".";
import { useTheme } from "@mui/material";
import { useRegisterEvents, useSigma } from "@react-sigma/core";


// The tickSpec and ticks are obtained from d3-ticks at https://github.com/d3/d3-array/blob/main/src/ticks.js
const e10 = Math.sqrt(50),
  e5 = Math.sqrt(10),
  e2 = Math.sqrt(2);

function tickSpec(start: number, stop: number, count: number): [number, number, number] {
  const step = (stop - start) / Math.max(1, count);
  const power = Math.floor(Math.log10(step));
  const error = step / Math.pow(10, power);
  const factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;

  let i1: number, i2: number, inc: number;

  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }

  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}

function ticks(start: number, stop: number, count: number): number[] {
  stop = +stop;
  start = +start;
  count = +count;

  if (!(count > 0)) return [];
  if (start === stop) return [start];

  const reverse = stop < start;
  const [i1, i2, inc] = reverse
    ? tickSpec(stop, start, count)
    : tickSpec(start, stop, count);

  if (!(i2 >= i1)) return [];

  const n = i2 - i1 + 1;
  const out = new Array<number>(n);

  if (reverse) {
    if (inc < 0) {
      for (let i = 0; i < n; ++i) out[i] = (i2 - i) / -inc;
    } else {
      for (let i = 0; i < n; ++i) out[i] = (i2 - i) * inc;
    }
  } else {
    if (inc < 0) {
      for (let i = 0; i < n; ++i) out[i] = (i1 + i) / -inc;
    } else {
      for (let i = 0; i < n; ++i) out[i] = (i1 + i) * inc;
    }
  }

  return out;
}

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
// Purpose is to write the labels of the axis in scientific notaition
function formatTickValue(value: number): string {
  if (value === 0) return "0";

  const [coefStr, expStr] = value.toExponential(3).split("e");
  const coef = Number(coefStr);
  const exp = Number(expStr);

  return `${coef}e${numberToSuperscript(exp)}`;
}

// ─── Types ─────────────────────────────────────────────────────────────

type AxisOverlayProps = {
  width: number;
  height: number;
  processedData: ScatterPlotScaleAndData;
};

type TickLabel = {
  value: number;
  label: string;
};

type ScatterPlotTickGenerationArgs = {
  processedData: ScatterPlotScaleAndData;
  sigma: any;
};

// Dynamic tick generation based on zoom factor
function ScatterPlotAxisTickGeneration({
  processedData,
  sigma,
}: ScatterPlotTickGenerationArgs): {
  xAxisTickValues: TickLabel[];
  yAxisTickValues: TickLabel[];
} {
  const { xMin, xMax, yMin, yMax } = processedData;

  const camera = sigma.getCamera();
  const { ratio } = camera.getState();

  // Control tick based on zoom in or out
  // In sigma when we zoom the ratio becomes smaller and when we zoom out ratio becomes larger
  // To prevent bottle necks the zoom will limited to a maximum of 100 ticks (When we zoom out and if the ratio is samller than 1e-2)
  const zoomFactor = 1 / Math.max(ratio, 1e-10); 
  const baseTickCount = 10;

  // console.log(zoomFactor, "zoomFactor")
  
  const countX = Math.max(2, Math.min(100, Math.round(baseTickCount * zoomFactor)));
  const countY = Math.max(2, Math.min(100, Math.round(baseTickCount * zoomFactor)));

  console.log(countX, "countX", countY, "zoomFactor", zoomFactor)

  const xValues = ticks(xMin, xMax, countX);
  const yValues = ticks(yMin, yMax, countY);

  const xAxisTickValues: TickLabel[] = xValues.map((value) => ({
    value,
    label: formatTickValue(value),
  }));

  const yAxisTickValues: TickLabel[] = yValues.map((value) => ({
    value,
    label: formatTickValue(value),
  }));

  return { xAxisTickValues, yAxisTickValues };
}
// Draw arrow at the end of the lines
function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, size = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size / 2);
  ctx.lineTo(-size, -size / 2);
  ctx.closePath();
  ctx.fill()

  ctx.restore();
}


function AxisOverlay({ width, height, processedData }: AxisOverlayProps) {
  const theme = useTheme();
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const xAxisLabel = processedData.xAxis ?? "X axis";
  const yAxisLabel = processedData.yAxis ?? "Y axis";

  const drawAxis = useCallback(() => {
    if (!canvas || !width || !height) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const { xMin, xMax, yMin, yMax } = processedData;
    if (
      xMin === undefined ||
      xMax === undefined ||
      yMin === undefined ||
      yMax === undefined
    ) {
      return;
    }

    // compute tick values from current bounds + zoom
    const { xAxisTickValues, yAxisTickValues } = ScatterPlotAxisTickGeneration({
      processedData,
      sigma,
    });

    ctx.strokeStyle = theme.palette.text.secondary;
    ctx.fillStyle = theme.palette.text.primary;
    ctx.lineWidth = 1;
    ctx.font = "12px Inter, system-ui, sans-serif";

    // axis positions in viewport coords
    const { x: xAxisStartX, y: xAxisY1 } = sigma.graphToViewport({
      x: xMin,
      y: yMin,
    });
    const xAxisY = Math.min(xAxisY1, height - 36)
    console.log(xAxisY, "xAxisY--")

    const { x: xAxisEndX } = sigma.graphToViewport({
      x: xMax,
      y: yMin,
    });

    const { x: yAxisX1, y: yAxisStartY } = sigma.graphToViewport({
      x: xMin,
      y: yMin,
    });
    const yAxisX = Math.max(yAxisX1, 72)
    console.log(yAxisX, "yAxisX--")
    console.log("Distance in X axis ", width - yAxisX1)
    const { y: yAxisEndY } = sigma.graphToViewport({
      x: xMin,
      y: yMax,
    });
    
    // x axis 
    ctx.beginPath();
    ctx.moveTo(xAxisStartX, xAxisY);
    ctx.lineTo(xAxisEndX, xAxisY);
    ctx.stroke();
    
    // Draw arrow at the end X axis
    drawArrow(ctx, xAxisEndX, xAxisY, 0);

    // X ticks
    xAxisTickValues.forEach(({ value, label }) => {
      const { x } = sigma.graphToViewport({ x: value, y: yMin });
      const y = xAxisY;
      if (x < 0 || x > width) {
        return 
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 6);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, x, y + 8);
    });

    // x axis label
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(xAxisLabel, (xAxisStartX + xAxisEndX) / 2, xAxisY + 40);

    // y axis
    ctx.beginPath();
    ctx.moveTo(yAxisX, yAxisStartY);
    ctx.lineTo(yAxisX, yAxisEndY);
    ctx.stroke();
    drawArrow(ctx, yAxisX, yAxisEndY, -Math.PI / 2);

    // y ticks
    yAxisTickValues.forEach(({ value, label }) => {
      const { y } = sigma.graphToViewport({ x: xMin, y: value });
      const x = yAxisX;
      if (y < 0 || y > height) {
        return 
      }
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y);
      ctx.stroke();

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x - 8, y);
    });
    
    // y axis label 
    ctx.save();
    ctx.translate(yAxisX - 24, (yAxisStartY + yAxisEndY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(yAxisLabel, 0, -30);
    ctx.restore();
  }, [canvas, width, height, processedData, sigma, theme, xAxisLabel, yAxisLabel]);

  useEffect(() => {
    if (!canvas) return;

    const update = () => drawAxis();
    update(); 

    registerEvents({ afterRender: update });
  }, [canvas, drawAxis, registerEvents]);

  return (
    // explicitly set the width and height of the canvas based on container obtained from AutoSize
    <canvas
      ref={(el) => {
        if (!el) return;
        const dpr = window.devicePixelRatio || 1;
        el.width = width * dpr;
        el.height = height * dpr;
        setCanvas(el);
      }}
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
      }}
    />
  );
}

export default AxisOverlay;

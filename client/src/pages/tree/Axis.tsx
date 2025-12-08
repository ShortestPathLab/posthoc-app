import { useTheme } from "@mui/material";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useCallback, useEffect, useState } from "react";
import { ScatterPlotScaleAndData } from ".";
import { scaleLinear } from "d3-scale";

const MIN_SPAN = 1e-6;

export function createScatterScale(min: number, max: number) {
  let lo = min;
  let hi = max;

  // Edge cases
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = 0;
    hi = 1;
  }

  if (lo === hi) {
    const mid = lo || 0;
    lo = mid - 0.5;
    hi = mid + 0.5;
  }

  let span = hi - lo;
  if (span < MIN_SPAN) {
    const mid = (lo + hi) / 2;
    lo = mid - MIN_SPAN / 2;
    hi = mid + MIN_SPAN / 2;
    span = hi - lo;
  }

  // add padding to points
  lo -= span * 0.05;
  hi += span * 0.05;
  // prevent padding from pushing the point to negative value if 
  // all the number are 0
  if (min >= 0 && lo < 0) {
    lo = 0;
  }

  return scaleLinear().domain([lo, hi]).nice();
}

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

  // Scaling to standardize extreme input ranges
  const xDataScale = createScatterScale(xMin, xMax);
  const yDataScale = createScatterScale(yMin, yMax);

  const [xLo, xHi] = xDataScale.domain();
  const [yLo, yHi] = yDataScale.domain();

  const zoomFactor = 1 / Math.max(ratio, 1e-10);
  const baseTickCount = 10;

  const countX = Math.max(2, Math.min(100, Math.round(baseTickCount * zoomFactor)));
  const countY = Math.max(2, Math.min(100, Math.round(baseTickCount * zoomFactor)));

  
  const xValues = xDataScale.ticks(countX);
  const yValues = yDataScale.ticks(countY);

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

  const xDataScale = createScatterScale(xMin, xMax);
  const yDataScale = createScatterScale(yMin, yMax);

  const [xLo, xHi] = xDataScale.domain();
  const [yLo, yHi] = yDataScale.domain();

  const xGraphScale = xDataScale.copy().range([-1, 1]);
  const yGraphScale = yDataScale.copy().range([-1, 1]);

  const xAxisDataY =
    yLo <= 0 && 0 <= yHi
      ? 0
      : yLo;

  const yAxisDataX =
    xLo <= 0 && 0 <= xHi
      ? 0
      : xLo;

  const { xAxisTickValues, yAxisTickValues } = ScatterPlotAxisTickGeneration({
    processedData,
    sigma,
  });

  ctx.strokeStyle = theme.palette.text.secondary;
  ctx.fillStyle = theme.palette.text.primary;
  ctx.lineWidth = 1;
  ctx.font = "12px Inter, system-ui, sans-serif";


  const { x: xAxisStartX, y: xAxisYRaw } = sigma.graphToViewport({
    x: xGraphScale(xLo),
    y: yGraphScale(xAxisDataY),
  });
  let xAxisY = xAxisYRaw;

  xAxisY = Math.min(xAxisY, height - 36);

  const { x: xAxisEndX } = sigma.graphToViewport({
    x: xGraphScale(xHi),
    y: yGraphScale(xAxisDataY),
  });


  const { x: yAxisXRaw, y: yAxisStartY } = sigma.graphToViewport({
    x: xGraphScale(yAxisDataX),
    y: yGraphScale(yLo),
  });
  let yAxisX = yAxisXRaw;
  yAxisX = Math.max(yAxisX, 72);

  const { y: yAxisEndY } = sigma.graphToViewport({
    x: xGraphScale(yAxisDataX),
    y: yGraphScale(yHi),
  });

  ctx.beginPath();
  ctx.moveTo(xAxisStartX, xAxisY);
  ctx.lineTo(xAxisEndX, xAxisY);
  ctx.stroke();
  drawArrow(ctx, xAxisEndX, xAxisY, 0);

  xAxisTickValues.slice(0, -1).forEach(({ value, label }) => {
    const { x } = sigma.graphToViewport({
      x: xGraphScale(value),
      y: yGraphScale(xAxisDataY),
    });
    const y = xAxisY;
    if (x < 0 || x > width) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 6);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, x, y + 8);
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(xAxisLabel, (xAxisStartX + xAxisEndX) / 2, xAxisY + 40);

  ctx.beginPath();
  ctx.moveTo(yAxisX, yAxisStartY);
  ctx.lineTo(yAxisX, yAxisEndY);
  ctx.stroke();
  drawArrow(ctx, yAxisX, yAxisEndY, -Math.PI / 2);


  yAxisTickValues.slice(0, -1).forEach(({ value, label }) => {
    const { y } = sigma.graphToViewport({
      x: xGraphScale(yAxisDataX),
      y: yGraphScale(value),
    });
    const x = yAxisX;
    if (y < 0 || y > height) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x - 8, y);
  });

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

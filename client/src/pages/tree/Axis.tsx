import { useTheme } from "@mui/material";
import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useCallback, useEffect, useState } from "react";
import { ScatterPlotScaleAndData } from ".";
import { scaleLinear, scaleLog } from "d3-scale";

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


export function createLogScatterScale(min: number, max: number) {
  let lo = min;
  let hi = max;

  // If domain is invalid for log, fall back to linear.
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= 0) {
    console.warn("[scatter] Log scale invalid domain; using linear:", { lo, hi });
    return createScatterScale(min, max);
  }

  // Mixed sign or touches zero → not safe for log
  if (lo <= 0) {
    console.warn("[scatter] Log scale lo <= 0; using linear:", { lo, hi });
    return createScatterScale(min, max);
  }

  return scaleLog()
    .base(10)
    .domain([lo, hi])
    .nice();
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
  logAxis: { x: boolean; y: boolean };
};


type TickLabel = {
  value: number;
  label: string;
};

type ScatterPlotTickGenerationArgs = {
  processedData: ScatterPlotScaleAndData;
  sigma: any;
  logAxis: { x: boolean; y: boolean };
};

// Dynamic tick generation based on zoom factor
function ScatterPlotAxisTickGeneration({
  processedData,
  sigma,
  logAxis
}: ScatterPlotTickGenerationArgs): {
  xAxisTickValues: TickLabel[];
  yAxisTickValues: TickLabel[];
} {
  const { xMin, xMax, yMin, yMax } = processedData;

  const camera = sigma.getCamera();
  const { ratio } = camera.getState();

  // Scaling to standardize extreme input ranges
  const xDataScale = logAxis?.x ? createLogScatterScale(xMin, xMax) : createScatterScale(xMin, xMax);
  const yDataScale = logAxis?.y ? createLogScatterScale(yMin, yMax) : createScatterScale(yMin, yMax);

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


function AxisOverlay({ width, height, processedData, logAxis }: AxisOverlayProps) {
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

    const xDataScale = logAxis.x
  ? createLogScatterScale(xMin, xMax)
  : createScatterScale(xMin, xMax);

const yDataScale = logAxis.y
  ? createLogScatterScale(yMin, yMax)
  : createScatterScale(yMin, yMax);

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
      logAxis
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
  }, [canvas, width, height, processedData, sigma, theme, xAxisLabel, yAxisLabel, logAxis.x, logAxis.y]);


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

import { ScatterPlotScaleAndData, ScatterPlotOutput, MetricsBag } from ".";

export const buildScatterPlotData = (
  traceData,
  xMetricName: string,
  yMetricName: string,
): ScatterPlotScaleAndData => {
  const scatterPlotData: ScatterPlotOutput[] = [];
  if (!traceData || !traceData.events) {
    return {
      data: [],
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
    };
  }
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  traceData.events.forEach((event, step) => {
    const metrics: MetricsBag = {};
    for (const key in event) {
      const num = Number(event[key]);
      if (!isNaN(num) && key !== "id" && key !== "pId") {
        metrics[key] = num;
      }
    }
    metrics.step = step;

    const x = metrics[xMetricName] ?? 0;
    const y = metrics[yMetricName] ?? 0;

    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
    // required to show unique node for each sub type of event per id
    const logicalId = String(event.id);
    const uniqueId = `${logicalId}-${step}`;

    scatterPlotData.push({
      x,
      y,
      point: {
        id: uniqueId,
        logicalId,
        label: logicalId,
        step,
        eventType: event.type,
        metrics,
      },
    });
  });

  if (!isNaN(xMax)) {
    const spanX = xMax - xMin || 1;
    xMax = xMax + spanX * 0.1;
  }

  if (!isNaN(yMax)) {
    const spanY = yMax - yMin || 1;
    yMax = yMax + spanY * 0.1;
  }

  return {
    data: scatterPlotData,
    xMin,
    xMax,
    yMax,
    yMin,
    xAxis: xMetricName,
    yAxis: yMetricName,
  };
};

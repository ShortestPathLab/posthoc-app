import { useTheme } from "@mui/material";
import interpolate from "color-interpolate";
import { getColorHex } from "components/renderer/colors";
import { NodeList } from "components/renderer/NodeList";
import { parseProperty } from "components/renderer/parser-v140/parseProperty";
import { parseProperty as parsePropertyLegacy } from "components/renderer/parser/parseProperty";
import { constant, head, last, map, startCase } from "lodash";
import { TraceEvent } from "protocol";
import { useMemo } from "react";
import { TraceLayer } from "./index";
import { makePathIndex } from "./makePathIndex";

const labelScale = 1.25;
const reuseCanvas = { canvas: document.createElement("canvas") };
/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text: string, font: string) {
  // re-use canvas object for better performance
  const canvas =
    reuseCanvas.canvas ||
    (reuseCanvas.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context!.font = font;
  const metrics = context!.measureText(text);
  return metrics.width;
}
const labelSize = 0.8;
export function use2DPath(
  layer?: TraceLayer,
  index: number = 0,
  step: number = 0
) {
  /// version < 1.4.0 compat
  const { palette } = useTheme();
  const { getPath } = useMemo(
    () =>
      layer?.source?.playback !== "playing" &&
      layer?.source?.parsedTrace?.content
        ? makePathIndex(layer.source.parsedTrace.content)
        : { getParent: constant(undefined), getPath: constant([]) },
    [layer?.source?.parsedTrace?.content, layer?.source?.playback]
  );
  const element = useMemo(() => {
    const n = interpolate([palette.background.paper, palette.text.primary])(
      0.05
    );
    const trace = layer?.source?.parsedTrace?.content;
    if (trace?.render?.path || trace?.pivot) {
      const pivot = trace?.render?.path?.pivot ?? trace?.pivot ?? {};
      const scale = trace?.render?.path?.scale
        ? trace.render.path.scale * (1 / 0.3)
        : trace?.pivot?.scale ?? 1;
      const { x, y } = pivot;

      const f =
        trace?.version === "1.4.0"
          ? parseProperty
          : (s: string) => (c: Partial<TraceEvent>) =>
              parsePropertyLegacy(s)({ event: c });

      const pivotX = x ? f(x) : (c: Partial<TraceEvent>) => c.x;
      const pivotY = y ? f(y) : (c: Partial<TraceEvent>) => c.y;

      const events = map(getPath(step), (p) => trace?.events?.[p]);
      const e = {
        x: pivotX({ x: 0, y: 0, ...head(events) }),
        y: pivotY({ x: 0, y: 0, ...head(events) }),
      };
      if (events.length) {
        const label = `${startCase(head(events)?.type)} ${head(events)?.id}`;
        const textWidth = getTextWidth(
          label,
          `${labelSize * scale * labelScale}px Inter`
        );
        const primitive = [
          {
            $: "circle",
            x: pivotX({ x: 0, y: 0, ...last(events) }),
            y: pivotY({ x: 0, y: 0, ...last(events) }),
            fill: palette.primary.main,
            radius: 0.3 * scale,
          },
          {
            $: "path",
            points: events.map((c) => ({
              x: pivotX({ x: 0, y: 0, ...c }),
              y: pivotY({ x: 0, y: 0, ...c }),
            })),
            fill: palette.primary.main,
            alpha: 1,
            lineWidth: 0.3 * scale,
          },
          {
            $: "circle",
            ...e,
            fill: palette.primary.main,
            radius: 0.3 * scale,
          },
          {
            $: "rect",
            alpha: 0.85,
            fill: n,
            x: e.x - 0.3 * scale * labelScale,
            y: e.y - 2 * scale * labelScale,
            width: textWidth + (0.8 + 0.5) * scale * labelScale,
            height: 1.4 * scale * labelScale,
          },
          {
            $: "path",
            points: [
              {
                x: e.x,
                y: e.y,
              },
              {
                x: e.x + (-0.3 - 0.05) * scale * labelScale,
                y: e.y + (-2 + 1.4) * scale * labelScale,
              },
            ],
            fill: getColorHex(head(events)?.type),
            alpha: 1,
            lineWidth: 0.1 * scale * labelScale,
          },
          {
            $: "rect",
            x: e.x + (-0.3 - 0.1) * scale * labelScale,
            y: e.y + -2 * scale * labelScale,
            fill: getColorHex(head(events)?.type),
            height: 1.4 * scale * labelScale,
            width: 0.1 * scale * labelScale,
          },
          {
            $: "rect",
            alpha: 0,
            fill: "rgba(255, 255, 255, 0)",
            x: e.x - 0.3 * scale * labelScale,
            y: e.y - 2 * scale * labelScale,
            width: textWidth * 2,
            height: 1 * scale * labelScale,
            label: label,
            "label-size": labelSize * scale * labelScale,
            "label-x": (0.1 + 0.5) * scale * labelScale,
            "label-y": 1 * scale * labelScale,
            "label-color": palette.text.primary,
          },
        ];
        return (
          <NodeList
            nodes={[
              map(primitive, (c) => ({
                component: c,
                meta: { source: "path", sourceLayerIndex: -99999 + index },
              })),
            ]}
          />
        );
      }
    }
    return <></>;
  }, [layer, index, step, palette, getPath]);
  return element;
}

import { useEffect, useRef } from "react";
import { D2Renderer } from "d2-renderer";
import { times } from "lodash-es";

const { meta, constructor } = D2Renderer;

export function D2RendererComponent({
  resolution = 0,
  threads = 1,
  tileSize = 256,
}: {
  resolution?: number;
  threads?: number;
  tileSize?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      const r = new constructor();
      r.setup({
        tileSubdivision: resolution,
        workerCount: threads,
        tileResolution: {
          width: tileSize,
          height: tileSize,
        },
        screenSize: {
          width: 640,
          height: 480,
        },
      });
      const remove = r.add(
        (
          [
            {
              $: "rect",
              x: 0,
              y: 0,
              width: 128,
              height: 128,
              alpha: 1,
              fill: "#ff0000",
              fontSize: 1,
              text: "",
            },
            {
              $: "rect",
              x: 0,
              y: 0,
              width: 16,
              height: 16,
              alpha: 1,
              fill: "#00ff00",
              fontSize: 1,
              text: "",
            },
            {
              $: "rect",
              x: 128 - 16,
              y: 128 - 16,
              width: 32,
              height: 32,
              alpha: 1,
              fill: "#ffff00",
              fontSize: 16,
              text: "",
            },
            {
              $: "rect",
              x: 128 - 32,
              y: 128 - 32,
              width: 8,
              height: 8,
              alpha: 1,
              fill: "#ffff00",
              fontSize: 16,
              text: "",
            },
            {
              $: "rect",
              x: 128 / 2,
              y: 128 / 2,
              width: 16,
              height: 16,
              alpha: 0,
              fill: "#000000",
              fontSize: 16,
              text: "Test",
            },
          ] as const
        ).map((c) => ({ component: c, meta: {} }))
      );
      ref.current.append(r.getView()!);
      return () => {
        r.destroy();
        ref.current?.removeChild?.(r.getView()!);
      };
    }
  }, [ref.current, resolution, threads, tileSize]);
  return <div ref={ref} />;
}

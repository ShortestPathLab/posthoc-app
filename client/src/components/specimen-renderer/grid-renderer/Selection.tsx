import { map } from "lodash";
import { Point } from "components/specimen-renderer/Renderer";
import { scale } from "./config";
import { useTween } from "react-use";
import { ComponentProps as PropsOf } from "react";
import { Node } from "./Node";

type SelectedProps = {
  animateScale?: boolean;
  animateAlpha?: boolean;
} & PropsOf<typeof Node>;

type Props = {
  hover?: Point;
  highlight?: Point;
};

export function Selected({
  x = 0,
  y = 0,
  animateScale,
  animateAlpha,
  ...props
}: SelectedProps) {
  const t = useTween("outCirc", 300);
  return (
    <Node
      {...props}
      scale={animateScale ? t : 1}
      x={x + (animateScale ? 1.5 * scale - 1.5 * scale * t : 0)}
      y={y + (animateScale ? 1.5 * scale - 1.5 * scale * t : 0)}
      radius={1}
      alpha={animateAlpha ? t : 1}
    />
  );
}

export function Selection({ hover, highlight }: Props) {
  return (
    <>
      {map(
        [
          { point: hover, color: 0xf9f9f9, animateAlpha: true },
          { point: highlight, color: 0xf1f1f1, animateScale: true },
        ],
        ({ point, ...props }, i) =>
          point && (
            <Selected
              key={`${i}::${point.x}::${point.y}`}
              x={point.x * scale}
              y={point.y * scale}
              {...props}
            />
          )
      )}
    </>
  );
}

import { useTween } from "react-use";
import { ComponentProps as PropsOf } from "react";
import { Node } from "./Node";
import { SCALE } from "./constants";

type Props = {
  animateScale?: boolean;
  animateAlpha?: boolean;
};

export function NodeSelection({
  x = 0,
  y = 0,
  animateScale,
  animateAlpha,
  ...props
}: PropsOf<typeof Node> & Props) {
  const t = useTween("outCirc", 300);
  return (
    <Node
      {...props}
      scale={animateScale ? t : 1}
      x={x + (animateScale ? 1.5 * SCALE - 1.5 * SCALE * t : 0)}
      y={y + (animateScale ? 1.5 * SCALE - 1.5 * SCALE * t : 0)}
      radius={1}
      alpha={animateAlpha ? t : 1}
    />
  );
}

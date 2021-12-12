import { useTween } from "react-use";
import { Node } from "./Draw";
import { ComponentProps as PropsOf } from "react";

export type SelectedProps = {
  animateScale?: boolean;
  animateAlpha?: boolean;
} & PropsOf<typeof Node>;

export function Selected({
  x = 0,
  y = 0,
  alpha = 0,
  animateScale,
  animateAlpha,
  ...props
}: SelectedProps) {
  const t = useTween("outCirc", 300);
  return (
    <Node
      {...props}
      scale={animateScale ? t : 1}
      x={x}
      y={y}
      radius={1}
      alpha={(animateAlpha ? t : 1) * alpha}
    />
  );
}

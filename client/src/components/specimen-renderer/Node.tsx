export type Graphic = {
  color?: number;
  radius?: number;
};

export type Line = {
  weight?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
};

export type Node = Graphic & Line;

export const coerce = (obj: any) => ({
  x1: obj?.x,
  y1: obj?.y,
  ...obj,
});

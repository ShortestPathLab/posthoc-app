import { Card, Stack } from "@mui/material";
import { NodeResizer } from "@xyflow/react";
import { reduce } from "es-toolkit/compat";
import { ReactNode } from "react";
import { useAcrylic, usePaper } from "theme";

export type ItemOptions = {
  y: number;
  height: number;
};

type T1 = {
  render: (options: ItemOptions) => ReactNode;
  height: number;
  y?: number;
};
export type NodeBaseProps = {
  itemHeight?: number;
  width?: number;
  items?: T1[];
};

export function NodeBase({ items, width: widthProp }: NodeBaseProps) {
  // Defaults moved out of destructures (here and in the map below) to avoid a
  // React Compiler bailout caused by object-destructuring defaults.
  const width = widthProp ?? 240;
  const acrylic = useAcrylic();
  const paper = usePaper();
  const computed = reduce(
    items,
    (prev, next) => ({
      y: prev.y + next.height,
      items: [
        ...prev.items,
        {
          ...next,
          y: prev.y,
        },
      ],
    }),
    { y: 0, items: [] as T1[] },
  );
  return (
    <>
      <NodeResizer
        lineStyle={{ opacity: 0 }}
        handleStyle={{ opacity: 0 }}
        minWidth={width}
        minHeight={computed.y}
      />
      <Card
        variant="outlined"
        sx={{
          ...acrylic,
          ...paper(),
          position: "relative",
          overflow: "visible", // so handles can poke out
          width: "100%",
          height: "100%",
          p: 0,
        }}
      >
        {computed.items?.map?.(({ render, height, y: yProp }, i) => {
          const y = yProp ?? 0;
          return (
            <Stack
              key={i}
              direction="row"
              sx={{
                maxHeight: height,
                height,
                width: "100%",
                alignItems: "center",
                px: 2,
              }}
            >
              {render({ y, height })}
            </Stack>
          );
        })}
      </Card>
    </>
  );
}

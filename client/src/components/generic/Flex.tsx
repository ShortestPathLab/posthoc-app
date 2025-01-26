import { Box, BoxProps } from "@mui/material";
import { Ref } from "react";

export type FlexProps = {
  vertical?: boolean;
} & BoxProps;

export const Flex = (
  { vertical, ...props }: FlexProps,
  ref: Ref<HTMLDivElement>
) => (
  <Box
    ref={ref}
    position="relative"
    height="100%"
    width="100%"
    display="flex"
    flexDirection={vertical ? "column" : "row"}
    {...props}
  />
);

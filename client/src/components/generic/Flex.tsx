import { Box, BoxProps } from "@mui/material";
import { forwardRef } from "react";

export type FlexProps = {
  vertical?: boolean;
} & BoxProps;

export const Flex = forwardRef(({ vertical, ...props }: FlexProps, ref) => (
  <Box
    ref={ref}
    position="relative"
    height="100%"
    width="100%"
    display="flex"
    flexDirection={vertical ? "column" : "row"}
    {...props}
  />
));

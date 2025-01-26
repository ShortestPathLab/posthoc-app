import { Box, BoxProps } from "@mui/material";

export type BlockProps = {
  vertical?: boolean;
} & BoxProps;

export const Block = ({ vertical, ...props }: BlockProps) => (
  <Box
    position="relative"
    height="100%"
    width="100%"
    display="flex"
    flexDirection={vertical ? "column" : "row"}
    {...props}
  />
);

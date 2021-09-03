import { Box, BoxProps } from "@material-ui/core";

export type FlexProps = {
  vertical?: boolean;
} & BoxProps;

export function Flex({ vertical, ...props }: FlexProps) {
  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      flexDirection={vertical ? "column" : "row"}
      {...props}
    />
  );
}

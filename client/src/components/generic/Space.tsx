import { Box } from "@material-ui/core";
import { BoxProps } from "@material-ui/system";

export function Space(props: BoxProps) {
  return <Box px={0.5} display="inline-block" {...props} />;
}

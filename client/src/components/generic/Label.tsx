import { Box } from "@mui/material";
import { ReactNode } from "react";
import { Flex } from "./Flex";
import { Space } from "./Space";

type LabelProps = {
  primary?: ReactNode;
  secondary?: ReactNode;
};

export function Label({ primary, secondary }: LabelProps) {
  return (
    <Flex>
      <Box>{primary}</Box>
      <Space />
      <Box sx={{ opacity: 0.56 }}>{secondary}</Box>
    </Flex>
  );
}

import { ReactNode } from "react";
import { Flex } from "./Flex";
import { Space } from "./Space";
import {
  Typography as Type,
  TypographyProps as TypeProps,
} from "@mui/material";



type Props = {
  label?: ReactNode;
  value?: ReactNode;
  type?: TypeProps<"div">;
};

export function Property({ label, value, type }: Props) {
  return (
    <Flex width="auto" mr={3} mt={0.5} key={`${label}::${value}`}>
      <Type component="div" sx={{ opacity: 0.54 }} {...type}>
        {label}
      </Type>
      <Space />
      <Type component="div" {...type}>
        {value ?? "none"}
      </Type>
    </Flex>
  );
}
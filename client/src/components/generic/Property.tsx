import { Flex } from "./Flex";
import {
  Typography as Type,
  TypographyProps as TypeProps,
} from "@material-ui/core";
import { Space } from "./Space";
import { ReactNode } from "react";

type Props = {
  label?: ReactNode;
  value?: ReactNode;
  type?: TypeProps;
};

export function Property({ label, value, type }: Props) {
  return (
    <Flex width="auto" mr={3} mt={0.5} key={`${label}::${value}`}>
      <Type sx={{ opacity: 0.54 }} {...type}>
        {label}
      </Type>
      <Space />
      <Type {...type}>{value}</Type>
    </Flex>
  );
}

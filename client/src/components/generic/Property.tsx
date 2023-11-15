import {
  Typography as Type,
  TypographyProps as TypeProps,
} from "@mui/material";
import { truncate } from "lodash";
import { ReactNode } from "react";
import { Flex } from "./Flex";
import { Space } from "./Space";

type Props = {
  label?: ReactNode;
  value?: any;
  type?: TypeProps<"div">;
};

function stringify(obj: any) {
  switch (typeof obj) {
    case "number":
    case "string":
      return `${obj}`;
    case "undefined":
      return "null";
    default:
      return (
        <code>
          {truncate(JSON.stringify(obj).replace("\n", ", "), {
            length: 30,
          })}
        </code>
      );
  }
}

export function Property({ label, value, type }: Props) {
  return (
    <Flex width="auto" mr={3} mb={0.5} key={`${label}::${stringify(value)}`}>
      <Type
        component="div"
        variant="body2"
        {...type}
        sx={{ opacity: 0.54, ...type?.sx }}
      >
        {label}
      </Type>
      <Space />
      <Type component="div" variant="body2" {...type}>
        {stringify(value) ?? "none"}
      </Type>
    </Flex>
  );
}

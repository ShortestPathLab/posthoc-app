import {
  Typography as Type,
  TypographyProps as TypeProps,
} from "@mui/material";
import beautify from "json-beautify";
import { get, isNull, round, truncate } from "lodash";
import { CSSProperties, ReactNode } from "react";
import { Block } from "./Block";
import { Space } from "./Space";

type Props = {
  label?: ReactNode;
  value?: unknown;
  type?: TypeProps<"div">;
  simple?: boolean;
};

const supProps: CSSProperties = {
  verticalAlign: "top",
  position: "relative",
  top: 0,
};

export function renderProperty(obj: unknown, simple: boolean = false) {
  switch (typeof obj) {
    case "number": {
      if (simple) {
        const [coefficient, exp] = obj
          .toExponential(2)
          .split("e")
          .map((item) => +item);
        return exp < -2 || exp > 4 ? (
          <span>
            {coefficient}×10<sup style={supProps}>{exp}</sup>
          </span>
        ) : (
          round(obj, 2)
        );
      } else {
        return obj;
      }
    }
    case "string":
      return `${obj}`;
    case "undefined":
      return "null";
    default:
      return simple ? (
        <code>
          {isNull(obj) ? "null" : get(obj, "constructor.name") ?? typeof obj}
        </code>
      ) : (
        <code style={{ whiteSpace: "pre" }}>
          {truncate(beautify(obj, undefined as unknown as object, 2), {
            length: 100,
          })}
        </code>
      );
  }
}

export function Property({ label, value, type, simple }: Props) {
  return (
    <Block
      width="auto"
      mr={2}
      mb={0.5}
      key={`${label}::${renderProperty(value)}`}
      alignItems="baseline"
    >
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
        {renderProperty(value, simple) ?? "none"}
      </Type>
    </Block>
  );
}

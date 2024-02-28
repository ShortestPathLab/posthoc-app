import { WidgetsOutlined } from "@mui/icons-material";
import { Typography as Type } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { ReactElement, ReactNode } from "react";

export function Placeholder({
  label,
  icon = <WidgetsOutlined />,
  secondary,
  ...rest
}: {
  label?: ReactNode;
  icon?: ReactElement;
  secondary?: ReactNode;
} & FlexProps) {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      sx={{
        gap: 2,
        background: (t) => `repeating-linear-gradient(
          45deg,
          ${t.palette.background.default},
          ${t.palette.background.paper} 1px,
          ${t.palette.background.paper} 7px,
          ${t.palette.background.default} 8px
        )`,
      }}
      textAlign="center"
      vertical
      pt={6}
      {...rest}
    >
      {icon}
      <Type>{label}</Type>
      {!!secondary && (
        <Type variant="caption" sx={{ px: 8, maxWidth: 480 }}>
          {secondary}
        </Type>
      )}
    </Flex>
  );
}

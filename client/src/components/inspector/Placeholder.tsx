import { WidgetsOutlined } from "@mui/icons-material";
import { Box, Typography as Type } from "@mui/material";
import { Flex, FlexProps } from "components/generic/Flex";
import { ReactElement, ReactNode } from "react";

export function Placeholder({
  label,
  icon = <WidgetsOutlined />,
  secondary,
  action,
  ...rest
}: {
  label?: ReactNode;
  icon?: ReactElement;
  secondary?: ReactNode;
  action?: ReactNode;
} & FlexProps) {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      sx={{
        gap: 2,
        p: 6,
        pt: 12,
        background: (t) => `repeating-linear-gradient(
          45deg,
          ${t.palette.background.default},
          transparent 1px,
          transparent 7px,
          ${t.palette.background.default} 8px
        )`,
      }}
      textAlign="center"
      vertical
      {...rest}
    >
      {icon}
      <Type component="div">{label}</Type>
      {!!secondary && (
        <Type component="div" variant="caption" sx={{ px: 8, maxWidth: 480 }}>
          {secondary}
        </Type>
      )}
      {!!action && <Box pt={2}>{action}</Box>}
    </Flex>
  );
}

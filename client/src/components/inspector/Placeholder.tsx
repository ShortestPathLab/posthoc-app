import { WidgetsOutlined } from "@mui-symbols-material/w400";
import { Box, Typography as Type } from "@mui/material";
import { Block, BlockProps } from "components/generic/Block";
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
} & BlockProps) {
  return (
    <Block
      justifyContent="center"
      alignItems="center"
      color="text.secondary"
      {...rest}
      textAlign="center"
      vertical
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
        ...rest.sx,
      }}
    >
      {icon}
      <Type component="div">{label}</Type>
      {!!secondary && (
        <Type component="div" variant="caption" sx={{ px: 8, maxWidth: 480 }}>
          {secondary}
        </Type>
      )}
      {!!action && <Box pt={2}>{action}</Box>}
    </Block>
  );
}

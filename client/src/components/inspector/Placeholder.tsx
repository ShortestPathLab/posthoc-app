import { CancelOutlined, RefreshOutlined, WidgetsOutlined } from "@mui-symbols-material/w300";
import { Box, Button, Typography as Type } from "@mui/material";
import { Block, BlockProps } from "components/generic/Block";
import { ComponentProps, ReactElement, ReactNode } from "react";

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
      {...rest}
      vertical
      sx={{
        justifyContent: "center",
        alignItems: "center",
        color: (t) => t.palette.text.secondary,
        textAlign: "center",
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
      {!!action && <Box sx={{ pt: 2 }}>{action}</Box>}
    </Block>
  );
}

export function ErrorPlaceholder({
  onReset,
  ...props
}: ComponentProps<typeof Placeholder> & { onReset?: () => void }) {
  return (
    <Placeholder
      icon={<CancelOutlined />}
      action={
        <Button variant="text" onClick={() => onReset?.()} startIcon={<RefreshOutlined />}>
          Reload
        </Button>
      }
      {...props}
      sx={{ bgcolor: "background.paper", ...props.sx }}
    />
  );
}

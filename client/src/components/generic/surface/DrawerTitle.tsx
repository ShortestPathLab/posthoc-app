import { CloseOutlined } from "@mui-symbols-material/w300";
import { IconButton, Stack } from "@mui/material";
import { useSm } from "hooks/useSmallDisplay";
import { ReactNode } from "react";
import { AppBarTitle as Title } from "./AppBarTitle";

export const drawerTitleHeight = 56;

export function DrawerTitle({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose?: () => void;
}) {
  const sm = useSm();
  return children ?
      <Stack
        direction="row"
        sx={{ px: sm ? 2 : 3, alignItems: "center", gap: 1, pb: 2 }}
      >
        <IconButton
          edge="start"
          onClick={onClose}
          sx={{ color: (t) => t.palette.text.secondary }}
        >
          <CloseOutlined color="inherit" />
        </IconButton>
        {typeof children === "string" ?
          <Title>{children}</Title>
        : children}
      </Stack>
    : null;
}

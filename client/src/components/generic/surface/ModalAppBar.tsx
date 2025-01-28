import { ArrowBackOutlined as ArrowBack } from "@mui-symbols-material/w400";
import { AppBar, AppBarProps, IconButton, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { AppBarTitle } from "./AppBarTitle";

export type ModalAppBarProps = {
  onClose?: () => void;
  simple?: boolean;
} & AppBarProps;

export function ModalAppBar({
  onClose = () => {},
  sx,
  children,
  simple,
  position = "sticky",
}: ModalAppBarProps) {
  function renderTitle(label: ReactNode) {
    return typeof label === "string" ? (
      <AppBarTitle>{label}</AppBarTitle>
    ) : (
      label
    );
  }

  return (
    <AppBar
      elevation={0}
      position={position}
      sx={{
        color: (t) => t.palette.text.primary,
        background: (t) => t.palette.background.paper,
        boxShadow: (t) => (simple ? undefined : t.shadows[0]),
        ...sx,
      }}
    >
      <Toolbar>
        <IconButton
          sx={{
            mr: (t) => t.spacing(1),
          }}
          edge="start"
          onClick={onClose}
        >
          <ArrowBack />
        </IconButton>

        {renderTitle(children)}
      </Toolbar>
    </AppBar>
  );
}

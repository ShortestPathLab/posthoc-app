import { useSm } from "hooks/useSmallDisplay";
import {
  PopupState as State,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { ReactElement, ReactNode } from "react";
import { AppBarTitle as Title } from "./AppBarTitle";
import { DrawerSurface } from "./DrawerSurface";
import { ModalAppBar } from "./ModalAppBar";
import { PopoverSurface } from "./PopoverSurface";
import { SlotProps } from "./SlotProps";
import { Box } from "@mui/material";

export type SurfaceGeneralProps = {
  title?: ReactNode;
  children?: ((state: State) => ReactNode) | ReactNode;
  popover?: boolean;
  slotProps?: SlotProps;
};

export type SurfaceProps = SurfaceGeneralProps & {
  trigger?: (state: State) => ReactElement;
};

export function Surface(props: SurfaceProps) {
  const state = usePopupState({ variant: "dialog" });
  return (
    <>
      {props.trigger?.(state)}
      <SurfaceBase {...props} state={state} />
    </>
  );
}

export type SurfaceBaseProps = SurfaceGeneralProps & { state: State };

function DrawerTitle({ children }: { children?: ReactNode }) {
  const sm = useSm();
  return children ? (
    typeof children === "string" ? (
      <Box sx={{ px: sm ? 2 : 3 }}>
        <Title>{children}</Title>
      </Box>
    ) : (
      children
    )
  ) : null;
}

export function SurfaceBase({
  title,
  children: _children,
  popover,
  slotProps,
  state,
}: SurfaceBaseProps) {
  const sm = useSm();
  const isPopover = popover && !sm;
  const children =
    typeof _children === "function" ? _children(state) : _children;
  const type = isPopover ? "popover" : "drawer";
  const SurfaceVariant = {
    drawer: DrawerSurface,
    modal: DrawerSurface,
    popover: PopoverSurface,
  }[type];

  const childrenVariant = {
    drawer: (
      <>
        <DrawerTitle>{title}</DrawerTitle>
        {children}
      </>
    ),
    modal: (
      <>
        <ModalAppBar onClose={state?.close} {...slotProps?.appBar}>
          {title}
        </ModalAppBar>
        {children}
      </>
    ),
    popover: children,
  }[type];
  return (
    <>
      {<SurfaceVariant {...{ slotProps, state, children: childrenVariant }} />}
    </>
  );
}

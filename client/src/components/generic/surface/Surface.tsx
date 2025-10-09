import { useSm } from "hooks/useSmallDisplay";
import {
  PopupState as State,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { ReactElement, ReactNode } from "react";
import { DrawerSurface } from "./DrawerSurface";
import { DrawerTitle } from "./DrawerTitle";
import { ModalAppBar } from "./ModalAppBar";
import { PopoverSurface } from "./PopoverSurface";
import { SlotProps } from "./SlotProps";
import { createPortal } from "react-dom";

export type SurfaceGeneralProps = {
  portal?: Element;
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

export function SurfaceBase({
  title,
  children: _children,
  popover,
  slotProps,
  state,
  portal,
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
        <DrawerTitle onClose={state?.close}>{title}</DrawerTitle>
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
  const element = (
    <SurfaceVariant {...{ slotProps, state, children: childrenVariant }} />
  );
  return <>{portal ? createPortal(element, portal) : element}</>;
}

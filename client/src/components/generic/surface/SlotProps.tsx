import {
  BoxProps,
  ModalProps,
  PopoverProps,
  SwipeableDrawerProps,
} from "@mui/material";
import { ScrollProps } from "../Scrollbars";
import { ModalAppBarProps } from "./ModalAppBar";

export type SlotProps = {
  drawer?: Partial<SwipeableDrawerProps> & { gap?: number };
  appBar?: Partial<ModalAppBarProps>;
  popover?: Partial<PopoverProps>;
  paper?: Partial<BoxProps>;
  modal?: Partial<ModalProps>;
  scroll?: Partial<ScrollProps>;
};

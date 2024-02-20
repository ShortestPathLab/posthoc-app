import { ArrowBack } from "@mui/icons-material";
import { ResizeSensor } from "css-element-queries";
import PopupState from "material-ui-popup-state";
import { ScrollPanel, usePanel } from "./ScrollPanel";
import { useScrollState } from "hooks/useScrollState";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import {
  AppBar,
  Box,
  Dialog,
  Fade,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

import {
  cloneElement,
  ComponentProps,
  CSSProperties,
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useEffect,
  useState,
} from "react";

export function AppBarTitle({ children }: { children?: ReactNode }) {
  return <Typography variant="h6">{children}</Typography>;
}

export type Props = {
  children?: ReactNode;
  actions?: ReactNode;
  width?: string | number;
  height?: string | number;
  onTarget?: (target: HTMLDivElement | null) => void;
  variant?: "default" | "submodal";
  scrollable?: boolean;
};

type ModalAppBarProps = {
  onClose?: () => void;
  style?: CSSProperties;
  elevatedStyle?: CSSProperties;
  transitionProperties?: string[];
  children?: ReactNode;
  elevatedChildren?: ReactNode;
  simple?: boolean;
  position?: "fixed" | "absolute" | "sticky" | "static";
};

export function ModalAppBar({
  onClose = () => {},
  style,
  elevatedStyle,
  children,
  transitionProperties = ["box-shadow", "background", "border-bottom"],
  elevatedChildren,
  simple,
  position = "sticky",
}: ModalAppBarProps) {
  const panel = usePanel();
  const theme = useTheme();
  const [, , isAbsoluteTop, , setTarget] = useScrollState();
  useEffect(() => {
    setTarget(panel);
  }, [panel, setTarget]);

  const styles = isAbsoluteTop
    ? {
        background: theme.palette.background.paper,
        ...(!simple && {
          boxShadow: theme.shadows[0],
        }),
        ...style,
      }
    : {
        background: theme.palette.background.paper,
        ...(!simple && {
          boxShadow: theme.shadows[4],
        }),
        ...elevatedStyle,
      };

  return (
    <AppBar
      elevation={0}
      position={position}
      style={{
        color: theme.palette.text.primary,
        transition: theme.transitions.create(transitionProperties),
        ...styles,
      }}
    >
      <Toolbar>
        <IconButton
          style={{
            marginRight: theme.spacing(1),
          }}
          aria-label="open drawer"
          edge="start"
          onClick={() => onClose()}
        >
          <ArrowBack />
        </IconButton>

        {children && (
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Fade
              in={!!(!elevatedChildren || isAbsoluteTop)}
              mountOnEnter
              unmountOnExit
            >
              <Box style={{ width: "100%" }}>{children}</Box>
            </Fade>
          </div>
        )}
        {elevatedChildren && (
          <div
            style={{
              gridColumn: 1,
              gridRow: 1,
              flex: 1,
              overflow: "auto",
            }}
          >
            <Fade
              in={!!(elevatedChildren && !isAbsoluteTop)}
              mountOnEnter
              unmountOnExit
            >
              <Box style={{ width: "100%" }}>{elevatedChildren}</Box>
            </Fade>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default function Modal({
  children,
  actions,
  width = 480,
  height,
  onTarget,
  variant = "default",
  scrollable = true,
  ...props
}: Props & ComponentProps<typeof Dialog>) {
  const [content, setContent] = useState<ReactNode | undefined>(undefined);
  useEffect(() => {
    if (children) setContent(children);
  }, [children]);
  const theme = useTheme();
  const sm = useSmallDisplay();

  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [contentRef, setContentRef] = useState<HTMLElement | null>(null);
  const [hasOverflowingChildren, setHasOverflowingChildren] = useState(false);
  const [childHeight, setChildHeight] = useState(0);

  useEffect(() => {
    if (target && contentRef && !sm && !height) {
      const callback = () => {
        const doesOverflow = window.innerHeight - 64 < contentRef.offsetHeight;
        setHasOverflowingChildren(doesOverflow);
        setChildHeight(
          contentRef.offsetHeight <= 1 ? 0 : Math.ceil(contentRef.offsetHeight)
        );
      };
      window.addEventListener("resize", callback);
      const ob = new ResizeSensor(contentRef, callback);
      callback();
      return () => {
        window.removeEventListener("resize", callback);
        ob.detach();
      };
    }
  }, [target, contentRef, sm, height]);

  const useVariant = variant === "submodal" && sm;

  return (
    <Dialog
      fullScreen={sm}
      {...props}
      style={{
        ...(useVariant && {
          paddingTop: theme.spacing(8),
        }),
        ...props.style,
      }}
      PaperProps={{
        ref: (e: HTMLElement | null) => setTarget(e),
        style: {
          ...(useVariant && {
            borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
          }),
          background: sm
            ? theme.palette.background.default
            : theme.palette.background.paper,
          overflow: "hidden",
          height:
            height && !sm
              ? height
              : hasOverflowingChildren || sm
              ? "100%"
              : childHeight || "fit-content",
          position: "relative",
          maxWidth: "none",
          ...(sm && { paddingTop: 36 }),
          ...props.PaperProps?.style,
        },
        ...props.PaperProps,
      }}
    >
      <ScrollPanel
        style={{
          height: "100%",
          width: sm ? undefined : width,
          maxWidth: "100%",
          overflow: scrollable ? undefined : "hidden",
        }}
        onTarget={onTarget}
      >
        <div
          ref={(e) => setContentRef(e)}
          style={{ width: "100%", height: "100%" }}
        >
          {content}
        </div>
      </ScrollPanel>
      {actions}
    </Dialog>
  );
}

export function ManagedModal({
  options: ModalProps,
  appBar: ModalAppBarProps,
  trigger = () => <></>,
  children,
}: {
  options?: ComponentProps<typeof Modal>;
  trigger?: (onClick: (e: SyntheticEvent<any, Event>) => void) => ReactElement;
  appBar?: ModalAppBarProps;
  children?: ReactNode;
}) {
  return (
    <PopupState variant="popover">
      {({ open, close, isOpen }) => {
        return (
          <>
            {cloneElement(trigger(open))}
            <Modal open={isOpen} onClose={close} {...ModalProps}>
              <ModalAppBar onClose={close} {...ModalAppBarProps} />
              {children ?? ModalProps?.children}
            </Modal>
          </>
        );
      }}
    </PopupState>
  );
}

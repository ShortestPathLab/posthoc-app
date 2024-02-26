import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Box,
  BoxProps,
  Dialog,
  Fade,
  IconButton,
  ModalProps,
  Popover,
  PopoverProps,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { ResizeSensor } from "css-element-queries";
import { useScrollState } from "hooks/useScrollState";
import { useSmallDisplay } from "hooks/useSmallDisplay";
import PopupState, { bindPopover } from "material-ui-popup-state";
import { usePanel } from "./ScrollPanel";

import { useTitleBarVisible } from "components/title-bar/TitleBar";
import { merge } from "lodash";
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
import { useAcrylic, usePaper } from "theme";
import { Scroll } from "./Scrollbars";

export function AppBarTitle({ children }: { children?: ReactNode }) {
  return <Typography variant="h6">{children}</Typography>;
}

export type Props = {
  children?: ReactNode;
  actions?: ReactNode;
  width?: string | number;
  height?: string | number;
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
  const sm = useSmallDisplay();
  const panel = usePanel();
  const theme = useTheme();
  const [, , isAbsoluteTop, , setTarget] = useScrollState();
  useEffect(() => {
    setTarget(panel);
  }, [panel, setTarget]);

  const styles = isAbsoluteTop
    ? {
        background: sm
          ? theme.palette.background.default
          : theme.palette.background.paper,
        ...(!simple && {
          boxShadow: theme.shadows[0],
        }),
        ...style,
      }
    : {
        background: sm
          ? theme.palette.background.default
          : theme.palette.background.paper,
        ...(!simple && {
          boxShadow: theme.shadows[4],
        }),
        ...elevatedStyle,
      };

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
              <Box style={{ width: "100%" }}>{renderTitle(children)}</Box>
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
              <Box style={{ width: "100%" }}>
                {renderTitle(elevatedChildren)}
              </Box>
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
  const titleBarVisible = useTitleBarVisible();

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
      keepMounted={false}
      TransitionProps={{
        unmountOnExit: true,
        mountOnEnter: true,
      }}
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
          ...(sm && titleBarVisible && { paddingTop: 36 }),
          ...props.PaperProps?.style,
        },
        ...props.PaperProps,
      }}
    >
      <Scroll
        y
        style={{
          height: "100%",
          width: sm ? undefined : width,
          maxWidth: "100%",
          overflow: scrollable ? undefined : "hidden",
        }}
      >
        <div ref={(e) => setContentRef(e)} style={{ width: "100%" }}>
          {content}
        </div>
      </Scroll>
      {actions}
    </Dialog>
  );
}

export function ManagedModal({
  appBar: ModalAppBarProps,
  trigger = () => <></>,
  children,
  popover,
  slotProps,
}: {
  options?: ComponentProps<typeof Modal>;
  trigger?: (
    onClick: (e: SyntheticEvent<any, Event>) => void,
    isOpen: boolean
  ) => ReactElement;
  appBar?: ModalAppBarProps;
  children?: ReactNode;
  popover?: boolean;
  slotProps?: {
    popover?: Partial<PopoverProps>;
    paper?: Partial<BoxProps>;
    modal?: Partial<ModalProps>;
  };
}) {
  const paper = usePaper();
  const acrylic = useAcrylic();
  const sm = useSmallDisplay();
  const shouldDisplayPopover = popover && !sm;
  return (
    <PopupState variant="popover">
      {(state) => {
        const { open, close, isOpen } = state;
        return (
          <>
            {cloneElement(trigger(open, isOpen))}
            {shouldDisplayPopover ? (
              <Popover
                {...merge(
                  bindPopover(state),
                  { slotProps: { paper: { sx: acrylic } } },
                  slotProps?.popover
                )}
              >
                <Box
                  {...merge(
                    { sx: { width: 360, ...paper(1) } },
                    slotProps?.paper
                  )}
                >
                  {children ?? slotProps?.modal?.children}
                </Box>
              </Popover>
            ) : (
              <Modal open={isOpen} onClose={close} {...slotProps?.modal}>
                <ModalAppBar onClose={close} {...ModalAppBarProps} />
                {children ?? slotProps?.modal?.children}
              </Modal>
            )}
          </>
        );
      }}
    </PopupState>
  );
}

export type ManagedModalProps = ComponentProps<typeof ManagedModal>;

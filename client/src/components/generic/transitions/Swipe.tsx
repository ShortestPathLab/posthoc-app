import { useForkRef, useTheme } from "@mui/material";
import { TransitionProps as MuiTransitionProps } from "@mui/material/transitions";
import { get } from "lodash-es";
import { cloneElement, ElementType, isValidElement, Ref, useRef } from "react";
import { Transition } from "react-transition-group";
import { EnterHandler, ExitHandler } from "react-transition-group/Transition";

export const reflow = (node: Element) => node.scrollTop;

interface ComponentProps1 {
  easing: string | { enter?: string; exit?: string } | undefined;
  style: React.CSSProperties | undefined;
  timeout: number | { enter?: number; exit?: number };
}

interface Options {
  mode: "enter" | "exit";
}

interface TransitionProps {
  duration: string | number;
  easing: string | undefined;
  delay: string | undefined;
}

export function getTransitionProps(
  props: ComponentProps1,
  options: Options
): TransitionProps {
  const { timeout, easing, style = {} } = props;

  return {
    duration:
      style.transitionDuration ??
      (typeof timeout === "number" ? timeout : timeout[options.mode] || 0),
    easing:
      style.transitionTimingFunction ??
      (typeof easing === "object" ? easing[options.mode] : easing),
    delay: style.transitionDelay,
  };
}

const styles = {
  entering: {
    transform: "translateY(0)",
    opacity: 1,
  },
  entered: {
    transform: "translateY(0)",
    opacity: 1,
  },
  exiting: {},
  exited: {},
  unmounted: {},
};

const Swipe = (
  props: MuiTransitionProps & {
    TransitionComponent?: ElementType;
    ref?: Ref<HTMLElement>;
  }
) => {
  const theme = useTheme();
  const defaultTimeout = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const {
    addEndListener,
    appear = true,
    children,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = defaultTimeout,
    TransitionComponent = Transition,
    ref,
    ...other
  } = props;

  const enableStrictModeCompat = true;
  const nodeRef = useRef<HTMLElement>(null);
  const handleRef = useForkRef(nodeRef, get(children, "ref"), ref);

  const normalizedTransitionCallback =
    (
      callback?:
        | EnterHandler<HTMLElement | undefined>
        | ExitHandler<HTMLElement | undefined>
    ) =>
    (maybeIsAppearing: boolean) => {
      if (callback) {
        const node = nodeRef.current;
        if (node) {
          // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
          if (maybeIsAppearing === undefined) {
            (callback as ExitHandler<undefined>)?.(node);
          } else {
            (callback as EnterHandler<undefined>)?.(node, maybeIsAppearing);
          }
        }
      }
    };

  const handleEntering = normalizedTransitionCallback(onEntering);

  const handleEnter = normalizedTransitionCallback(
    (node: HTMLElement, isAppearing: boolean) => {
      reflow(node); // So the animation always start from the start.
      const transitionProps = getTransitionProps(
        { style, timeout, easing },
        {
          mode: "enter",
        }
      );

      node.style.transition = theme.transitions.create(
        ["opacity", "transform"],
        transitionProps
      );

      if (onEnter) {
        onEnter(node, isAppearing);
      }
    }
  );

  const handleEntered = normalizedTransitionCallback(onEntered);

  const handleExiting = normalizedTransitionCallback(onExiting);

  const handleExit = normalizedTransitionCallback((node: HTMLElement) => {
    const transitionProps = getTransitionProps(
      { style, timeout, easing },
      {
        mode: "exit",
      }
    );

    node.style.transition = theme.transitions.create(
      ["opacity", "transform"],
      transitionProps
    );

    if (onExit) {
      onExit(node);
    }
  });

  const handleExited = normalizedTransitionCallback(onExited);

  const handleAddEndListener = (next: () => void) => {
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(nodeRef.current!, next);
    }
  };

  return (
    <TransitionComponent
      appear={appear}
      in={inProp}
      nodeRef={enableStrictModeCompat ? nodeRef : undefined}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      timeout={timeout}
      {...other}
    >
      {(state: keyof typeof styles, childProps: Record<string, unknown>) => {
        return (
          children &&
          isValidElement(children) &&
          cloneElement(children, {
            style: {
              transform: "translateY(16px)",
              opacity: 0,
              visibility: state === "exited" && !inProp ? "hidden" : undefined,
              ...styles[state],
              ...style,
              ...children.props.style,
            },
            ref: handleRef,
            ...childProps,
          } as Record<string, unknown>)
        );
      }}
    </TransitionComponent>
  );
};

export default Swipe;

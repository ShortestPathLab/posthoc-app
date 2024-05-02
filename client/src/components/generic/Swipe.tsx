import { useForkRef, useTheme } from "@mui/material";
import * as React from "react";
import { Transition } from "react-transition-group";
export const reflow = (node: Element) => node.scrollTop;

interface ComponentProps {
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
  props: ComponentProps,
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
} as any;

/**
 * The Fade transition is used by the [Modal](/material-ui/react-modal/) component.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Swipe = React.forwardRef<any, any>((props, ref) => {
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
    // eslint-disable-next-line react/prop-types
    TransitionComponent = Transition,
    ...other
  } = props;

  const enableStrictModeCompat = true;
  const nodeRef = React.useRef(null);
  const handleRef = useForkRef(nodeRef, children.ref, ref);

  const normalizedTransitionCallback =
    (callback: any) => (maybeIsAppearing: any) => {
      if (callback) {
        const node = nodeRef.current;

        // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
        if (maybeIsAppearing === undefined) {
          callback(node);
        } else {
          callback(node, maybeIsAppearing);
        }
      }
    };

  const handleEntering = normalizedTransitionCallback(onEntering);

  const handleEnter = normalizedTransitionCallback(
    (node: any, isAppearing: any) => {
      reflow(node); // So the animation always start from the start.

      const transitionProps = getTransitionProps(
        { style, timeout, easing },
        {
          mode: "enter",
        }
      );

      node.style.webkitTransition = theme.transitions.create(
        ["opacity", "transform"],
        transitionProps
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

  const handleExit = normalizedTransitionCallback((node: any) => {
    const transitionProps = getTransitionProps(
      { style, timeout, easing },
      {
        mode: "exit",
      }
    );

    node.style.webkitTransition = theme.transitions.create(
      ["opacity", "transform"],
      transitionProps
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

  const handleAddEndListener = (next: any) => {
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(nodeRef.current, next);
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
      {(state: any, childProps: any) => {
        return React.cloneElement(children, {
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
        });
      }}
    </TransitionComponent>
  );
});

export default Swipe;

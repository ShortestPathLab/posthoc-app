import { noop } from "es-toolkit";
import { merge } from "es-toolkit/compat";
import { PopupState as State, usePopupState } from "material-ui-popup-state/hooks";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createCallable } from "react-call";
import { SurfaceBase, SurfaceProps } from "./Surface";

export type SurfaceContentProps = {
  onClose: () => void;
  onProps: (p: Partial<SurfaceProps>) => void;
};

type SurfaceCallProps = {
  render: (props: SurfaceContentProps) => ReactNode;
  surfaceProps?: SurfaceProps;
};

/**
 * A single, app-root-level host that renders any surface (dialog/drawer)
 * passed to it at call time. Built on `react-call`, so a surface is rendered
 * at the root of the tree rather than inline next to whatever opened it.
 *
 * This decouples a surface's lifetime from its opener: a dialog opened from
 * within another dialog (or any component that later unmounts) stays open
 * instead of being torn down with its parent.
 *
 * Instead of a `material-ui-popup-state` trigger, the popup's open/close is
 * driven synthetically from react-call's call lifecycle:
 *  - `entered` flips true after mount so the enter transition plays,
 *  - `call.ended` flips true on close so the exit transition plays, and
 *  - `close` resolves the call, after which react-call unmounts the host
 *    once the unmount delay (matching the surface transition) elapses.
 *
 * Mount `<GlobalSurface />` once near the app root (see `App.tsx`).
 */
export const GlobalSurface = createCallable<SurfaceCallProps, void>(function SurfaceCall({
  call,
  render,
  surfaceProps,
}) {
  const [entered, setEntered] = useState(false);
  const [overrides, setOverrides] = useState<Partial<SurfaceProps>>({});
  useEffect(() => setEntered(true), []);
  const base = usePopupState({ variant: "dialog" });
  const state: State = {
    ...base,
    isOpen: entered && !call.ended,
    open: noop,
    close: () => call.end(),
  };
  return (
    <SurfaceBase {...merge({}, surfaceProps, overrides)} state={state}>
      {render({ onClose: () => call.end(), onProps: setOverrides })}
    </SurfaceBase>
  );
}, 500);

/**
 * Imperatively open a surface at the app root. `render` receives `onClose`
 * (resolve/close the surface) and `onProps` (update the surface's props, e.g.
 * title/slotProps, while it's open). Returns a handle to close it externally.
 */
export function openSurface(
  render: (props: SurfaceContentProps) => ReactNode,
  surfaceProps: SurfaceProps = {},
) {
  const promise = GlobalSurface.call({ render, surfaceProps });
  return { promise, close: () => GlobalSurface.end(promise) };
}

/**
 * Drop-in for the legacy `useSurface`: takes the surface content component and
 * returns `{ open, close }`. Unlike before, there is no `dialog` element to
 * render inline — the content is hosted by `<GlobalSurface />` at the app root.
 */
export function useSurface<T>(
  Content?: (props: T & SurfaceContentProps) => ReactNode,
  props: SurfaceProps = {},
) {
  const ref = useRef<ReturnType<typeof openSurface> | null>(null);
  const open = (s: T & Partial<SurfaceContentProps>) => {
    ref.current = openSurface(
      ({ onClose, onProps }) =>
        Content ? (
          <Content
            {...(s as T & SurfaceContentProps)}
            onClose={() => {
              onClose();
              s.onClose?.();
            }}
            onProps={onProps}
          />
        ) : null,
      props,
    );
    return ref.current.promise;
  };
  const close = () => ref.current?.close();
  return { open, close };
}

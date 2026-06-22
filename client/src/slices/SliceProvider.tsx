import { map, reduce } from "es-toolkit/compat";
import { cloneElement, createElement, FunctionComponent, ReactNode } from "react";

type Service = () => ReactNode | void;

type SliceProviderProps = {
  slices?: FunctionComponent[];
  services?: Service[];
  children?: ReactNode;
};

// Stable component type so each service keeps a constant identity across
// renders. Wrapping the service inline (e.g. via `flow`) would create a fresh
// component type every render, causing React to remount every service whenever
// SliceProvider re-renders.
function ServiceRunner({ use }: { use: Service }) {
  return use() ?? null;
}

export function SliceProvider({ slices, children, services = [] }: SliceProviderProps) {
  return (
    <>
      {reduce(
        map(slices, (s) => createElement(s)),
        (prev, next) => cloneElement(next, {}, prev),
        <>
          {children}
          {map(services.toReversed(), (s, i) =>
            createElement(ServiceRunner, { key: i, use: s }),
          )}
        </>,
      )}
    </>
  );
}

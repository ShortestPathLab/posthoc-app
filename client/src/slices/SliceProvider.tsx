import { flow, map, reduce } from "lodash";
import {
  cloneElement,
  createElement,
  FunctionComponent,
  ReactNode,
} from "react";

type SliceProviderProps = {
  slices?: FunctionComponent[];
  services?: (() => ReactNode | void)[];
  children?: ReactNode;
};

export function SliceProvider({
  slices,
  children,
  services = [],
}: SliceProviderProps) {
  return (
    <>
      {reduce(
        map(slices, (s) => createElement(s)),
        (prev, next) => cloneElement(next, {}, prev),
        <>
          {children}
          {map(services.toReversed(), (s, i) =>
            createElement(
              flow(s, (b) => b ?? null),
              { key: i }
            )
          )}
        </>
      )}
    </>
  );
}

import { map, reduce } from "lodash";
import {
  cloneElement,
  createElement,
  FunctionComponent,
  ReactNode,
} from "react";

type SliceProviderProps = {
  slices?: FunctionComponent[];
  children?: ReactNode;
};

export function SliceProvider({ slices, children }: SliceProviderProps) {
  return (
    <>
      {reduce(
        map(slices, (s) => createElement(s)),
        (prev, next) => cloneElement(next, {}, prev),
        children
      )}
    </>
  );
}

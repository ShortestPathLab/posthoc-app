import { EditorSetterProps } from "components/Editor";
import { clone } from "lodash";
import { ReactNode, createElement } from "react";

export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = clone(obj);
  f(b);
  return b;
}
export function transaction<T, U>(obj: T, f: (obj: T) => U) {
  const b = f(clone(obj));
  return b;
}

export const producify =
  <T>(f: (obj: T) => void) =>
  (obj: T) => {
    const b = clone(obj);
    f(b);
    return b;
  };

export function withProduce<T>(
  component: (
    props: EditorSetterProps<T> & {
      produce: (f: (obj: T) => void) => void;
    }
  ) => ReactNode
) {
  return (props: EditorSetterProps<T>) =>
    createElement(component, {
      ...props,
      produce: (f) => props?.onChange?.(producify(f)),
    });
}

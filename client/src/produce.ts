import { EditorSetterProps } from "components/Editor";
import { isEqual } from "lodash";
import { createElement, ReactNode } from "react";

export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = structuredClone(obj);
  f(b);
  return isEqual(b, obj) ? obj : b;
}
export function produce2<T, U>(obj: T, f: (obj: T) => U) {
  const b = f(structuredClone(obj));
  return isEqual(b, obj) ? obj : b;
}

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
      produce: (f) => props?.onChange?.((prev) => produce(prev, f)),
    });
}

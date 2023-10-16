import { createElement, ReactNode } from "react";
import { EditorProps } from "components/Editor";

export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = structuredClone(obj);
  f(b);
  return b;
}
export function produce2<T, U>(obj: T, f: (obj: T) => U) {
  return f(structuredClone(obj));
}

export function withProduce<T>(
  component: (
    props: EditorProps<T> & {
      produce: (f: (obj: T) => void) => void;
    }
  ) => ReactNode
) {
  return (props: EditorProps<T>) =>
    createElement(component, {
      ...props,
      produce: (f) => props?.onChange?.(produce(props!.value!, f)),
    });
}

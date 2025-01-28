import { EditorSetterProps } from "components/Editor";
import { clone } from "lodash";
import { createElement, ReactElement } from "react";

export function produce<T>(obj: T, f: (obj: T) => void) {
  const b = clone(obj);
  f(b);
  return b;
}

export async function produceAsync<T>(obj: T, f: (obj: T) => Promise<void>) {
  const b = clone(obj);
  await f(b);
  return b;
}

export function transaction<T, U>(obj: T, f: (obj: T) => U) {
  return f(clone(obj));
}

export async function transactionAsync<T, U>(
  obj: T,
  f: (obj: T) => Promise<U>
) {
  return await f(clone(obj));
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
  ) => ReactElement
) {
  return function WithProduce(props: EditorSetterProps<T>) {
    return createElement(component, {
      ...props,
      produce: (f) => props?.onChange?.(producify(f)),
    });
  };
}

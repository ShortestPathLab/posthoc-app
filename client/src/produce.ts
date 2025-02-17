import { EditorSetterProps } from "components/Editor";
import { isDefined } from "pages/tree/TreeGraph";
import { createElement, ReactElement } from "react";
import { Transaction } from "slices/selector";

export function clone<T>(obj: T) {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

export function produce<T>(obj: T, f: Transaction<T>) {
  const b = clone(obj);
  const out = f(b);
  return isDefined(out) ? out! : b;
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

export const producifyAsync =
  <T>(f: (obj: T) => Promise<void>) =>
  async (obj: T) => {
    const b = clone(obj);
    await f(b);
    return b;
  };

export const producify =
  <T>(f: (obj: T) => void) =>
  (obj: T) => {
    const b = clone(obj);
    f(b);
    return b;
  };

export type ServiceProps<T> = EditorSetterProps<T> & {
  produce: (f: (obj: T) => void) => void;
};

export function withProduce<T>(
  component: (props: ServiceProps<T>) => ReactElement
) {
  return function WithProduce(props: EditorSetterProps<T>) {
    return createElement(component, {
      ...props,
      produce: (f) => props?.onChange?.(producify(f)),
    });
  };
}

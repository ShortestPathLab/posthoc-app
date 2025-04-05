import { EditorSetterProps } from "components/Editor";
import * as immer from "immer";
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
  return immer.produce(obj, f);
  // const out = f(b);
  // return isDefined(out) ? out! : b;
}

export async function produceAsync<T extends object>(
  obj: T,
  f: (obj: T) => Promise<void>
) {
  const draft = immer.createDraft(obj);
  await f(draft as T);
  return immer.finishDraft(draft);
}

export function transaction<
  T extends object,
  U extends ValidRecipeReturnType<T>,
>(obj: T, f: (obj: T) => U) {
  return immer.produce(obj, f);
}

export async function transactionAsync<T, U>(
  obj: T,
  f: (obj: T) => Promise<U>
) {
  return await produceAsync(obj, f);
}

export const producifyAsync =
  <T>(f: (obj: T) => Promise<void>) =>
  async (obj: T) => {
    return await produceAsync(obj, f);
  };

export const producify =
  <T>(f: (obj: T) => void) =>
  (obj: T) => {
    return produce(obj, f);
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

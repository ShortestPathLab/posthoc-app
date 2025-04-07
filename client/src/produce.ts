import { EditorSetterProps } from "components/Editor";
import { createDraft, finishDraft, produce } from "immer";
import { createElement, ReactElement } from "react";

export async function produceAsync<T extends object>(
  obj: T,
  f: (obj: T) => Promise<void>
) {
  const draft = createDraft(obj);
  await f(draft as T);
  return finishDraft(draft);
}

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
      produce: (f) => props?.onChange?.(produce(f)),
    });
  };
}

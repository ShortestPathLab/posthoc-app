import { ReactNode } from "react";

export type EditorProps<T> = {
  value?: T;
  onChange?: (key: T) => void;
};
export type EditorSetterProps<T> = {
  value?: T;
  onChange?: (key: (value: T) => T) => void;
  children?: ReactNode;
};

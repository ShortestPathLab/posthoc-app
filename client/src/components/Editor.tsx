export type EditorProps<T> = {
  value?: T;
  onChange?: (key: T) => void;
};

import { useRef } from "react";

export function useInitialRender() {
  const ref = useRef(false);
  // eslint-disable-next-line react-compiler/react-compiler
  const current = ref.current;
  // eslint-disable-next-line react-compiler/react-compiler
  ref.current = true;
  return !current;
}

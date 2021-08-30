import { useEffect } from "react";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  children?: ReactNode;
};

export function makePortal(query: string) {
  return ({ children }: PortalProps) => {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
      const container = document.querySelector(query);
      if (container) {
        const node = container.appendChild(document.createElement("div"));
        setRef(node);
        return () => {
          container.removeChild(node);
        };
      }
    }, []);
    return ref ? createPortal(children, ref) : <></>;
  };
}

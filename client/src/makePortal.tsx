import { forIn, set } from "lodash";
import { CSSProperties, useEffect } from "react";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";

type PortalProps = {
  replace?: boolean;
  children?: ReactNode;
};

type StyledElement = Node & { style: CSSProperties };

function isStyledElement(element: Node): element is StyledElement {
  return "style" in element;
}

const hiddenStyles = {
  position: "fixed",
  top: "100vh",
  zIndex: 1,
};

export function makePortal(query: string) {
  return ({ children, replace }: PortalProps) => {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
      const target = document.querySelector(query);
      if (target) {
        if (replace) {
          target.childNodes.forEach(
            (c) =>
              isStyledElement(c) &&
              forIn(hiddenStyles, (v, k) => set(c.style, k, v))
          );
        }
        const node = target.appendChild(document.createElement("div"));
        setRef(node);
        return () => {
          target.removeChild(node);
          if (replace) {
            target.childNodes.forEach(
              (c) =>
                isStyledElement(c) &&
                forIn(hiddenStyles, (_, k) => set(c.style, k, undefined))
            );
          }
        };
      }
    }, []);
    return ref ? createPortal(children, ref) : <></>;
  };
}

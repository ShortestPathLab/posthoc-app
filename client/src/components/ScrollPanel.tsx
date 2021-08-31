import { noop } from "lodash";
import {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { AutoSizer } from "react-virtualized";

export function ScrollPanel({
  onTarget = noop,
  onScroll,
  ...props
}: ComponentProps<"div"> & {
  onTarget?: (e: HTMLDivElement | null) => void;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (target && onScroll) {
      target.addEventListener("scroll", onScroll as any, { passive: true });
      return () => target.removeEventListener("scroll", onScroll as any);
    }
  }, [target, onScroll]);

  return (
    <AutoSizer style={{ width: "100%", height: "100%" }}>
      {({ width, height }) => (
        <div
          {...props}
          className="scroll"
          style={{
            height,
            overflow: "hidden scroll",
            ...props.style,
          }}
          ref={(e) => {
            setTarget(e);
            onTarget?.(e);
          }}
        >
          <PanelContext.Provider value={target}>
            <div
              style={{
                minHeight: height,
                width,
              }}
            >
              {props.children}
            </div>
          </PanelContext.Provider>
        </div>
      )}
    </AutoSizer>
  );
}
const PanelContext = createContext<HTMLDivElement | null>(null);

export function usePanel() {
  return useContext(PanelContext);
}

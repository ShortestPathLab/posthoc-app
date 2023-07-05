import {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type ScrollPanelProps = {
  onTarget?: (e: HTMLDivElement | null) => void;
} & ComponentProps<"div">;

export function ScrollPanel({
  onTarget,
  onScroll,
  ...props
}: ScrollPanelProps) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (target && onScroll) {
      target.addEventListener("scroll", onScroll as any, { passive: true });
      return () => target.removeEventListener("scroll", onScroll as any);
    }
  }, [target, onScroll]);

  return (
    <div
      {...props}
      style={{
        height: "100%",
        width: "100%",
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
            width: "100%",
          }}
        >
          {props.children}
        </div>
      </PanelContext.Provider>
    </div>
  );
}
const PanelContext = createContext<HTMLDivElement | null>(null);

export function usePanel() {
  return useContext(PanelContext);
}

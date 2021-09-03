import { ReactNode } from "react";
import { usePanel } from "./ScrollPanel";
import { useInView } from "react-intersection-observer";
import { chunk, floor, map, max } from "lodash";

function Segment({
  placeholder,
  children,
}: {
  children?: ReactNode[];
  placeholder?: ReactNode;
}) {
  const { ref, inView: inView } = useInView();

  return (
    <div ref={ref} style={{ display: "grid" }}>
      {inView ? (
        <div
          style={{
            gridColumn: 1,
            gridRow: 1,
          }}
          key="children"
        >
          {children}
        </div>
      ) : (
        <div
          style={{
            gridColumn: 1,
            gridRow: 1,
          }}
          key="placeholder"
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}

export function Lazy({
  children,
  rowHeight = 1,
}: {
  children?: ReactNode[];
  rowHeight?: number;
}) {
  const chunkSize = max([10, floor((children?.length ?? 0) / 100)]);

  return (
    <>
      {map(chunk(children, chunkSize), (c, i) => (
        <Segment
          placeholder={<div style={{ height: c.length * rowHeight }}></div>}
        >
          {c}
        </Segment>
      ))}
    </>
  );
}

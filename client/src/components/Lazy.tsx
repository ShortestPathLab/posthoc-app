import { ceil, chunk, map, max } from "lodash";
import { ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type SegmentProps = {
  children?: ReactNode;
  estimateHeight?: number;
  renderChildren?: () => ReactNode;
};

function Segment({ estimateHeight: height = 0, renderChildren }: SegmentProps) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ height: inView ? undefined : height }}>
      {inView && renderChildren?.()}
    </div>
  );
}

const SCALE = 2;
const MIN_ITEMS = 16;

type LazyProps<T> = {
  items?: T[];
  rowHeight?: number;
  renderItem?: (item: T, index: number) => ReactNode;
  offset?: number;
};

export function Lazy<T>({
  items,
  renderItem,
  rowHeight = 1,
  offset = 0,
}: LazyProps<T>) {
  const chunkSize = max([SCALE, ceil((items?.length ?? 0) / SCALE)])!;
  return (
    <>
      {map(chunk(items, chunkSize), (segment, i) => {
        const o = offset + i * chunkSize;
        return (
          <Segment
            key={i}
            estimateHeight={segment.length * rowHeight}
            renderChildren={() =>
              segment.length <= MIN_ITEMS ? (
                map(segment, (child, j) => renderItem?.(child, o + j))
              ) : (
                <Lazy
                  items={segment}
                  rowHeight={rowHeight}
                  renderItem={renderItem}
                  offset={o}
                />
              )
            }
          />
        );
      })}
    </>
  );
}

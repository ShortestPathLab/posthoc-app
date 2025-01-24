import { filter, findLast, map } from "lodash";
import { Trace } from "protocol";
import { useMemo, useState } from "react";
import { Selection } from "./GraphEvents";

export function useSelection(step: number, trace: Trace | undefined) {
  const [selection, setSelection] = useState<Selection>();

  const point = selection
    ? selection.event instanceof MouseEvent
      ? {
          x: selection.event.clientX,
          y: selection.event.clientY,
        }
      : {
          x: selection.event.touches?.[0]?.clientX,
          y: selection.event.touches?.[0]?.clientY,
        }
    : { x: 0, y: 0 };

  const selected = useMemo(() => {
    const events = filter(
      map(trace?.events, (c, i) => ({ event: c, step: i })),
      (c) => `${c.event.id}` === selection?.node
    );
    return { events, current: findLast(events, (c) => c.step <= step) };
  }, [selection, step]);
  return { selection, setSelection, point, selected };
}

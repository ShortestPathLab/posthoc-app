import { index } from "hooks/useHighlight";
import { findLast, forEach, isNull, isUndefined, last } from "lodash-es";
import { Trace } from "protocol/Trace";

const isNullish = (x: KeyRef): x is Exclude<KeyRef, Key> =>
  isUndefined(x) || isNull(x);

type Key = string | number;

type KeyRef = Key | null | undefined;

export type Node = {
  id: Key;
  pId?: KeyRef;
  step: number;
  prev?: Node;
};

export function makePathIndex(trace: Trace) {
  const changes: Node[] = [];
  const allChanges: {
    [K in Key]: KeyRef;
  } = {};
  const stepToChange: {
    [K in number]?: Node;
  } = {};

  const r = index(trace?.events);

  forEach(trace?.events, ({ id, pId }, i) => {
    if (!isNullish(pId) && allChanges[id] !== pId) {
      changes.push({ id, pId, step: i, prev: last(changes) });
      allChanges[id] = pId;
    }
    stepToChange[i] = last(changes);
  });
  const getParent = (id: Key, step: number = trace?.events?.length ?? 0) => {
    let entry = stepToChange[step];
    while (entry) {
      if (entry.id === id) return entry.pId;
      entry = entry.prev;
    }
  };
  const getPath = (step: number) => {
    const path = [step];
    let current: Node | undefined = {
      ...(trace.events ?? [])[step],
      step,
    };
    while (current) {
      const pId = getParent(current.id, current.step);
      if (pId) {
        const event = findLast(r[pId], (c) => c.step <= current!.step);
        if (event) {
          path.push(event.step);
          current = event;
        } else break;
      } else break;
    }
    return path;
  };
  return { getParent, getPath };
}

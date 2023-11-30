import { call } from "components/script-editor/call";
import { get, keyBy, toLower as lower, startCase } from "lodash";
import memoizee from "memoizee";
import { TraceEventType } from "protocol";
import { useMemo } from "react";
import { UploadedTrace } from "slices/UIState";
import { useLayer } from "slices/layers";


export type Comparator = {
  key: string;
  apply: (value: number, reference: number) => boolean;
};

export type Breakpoint = {
  key: string;
  property?: string;
  reference?: number;
  condition?: Comparator;
  active?: boolean;
  type?: TraceEventType;
};

export type DebugLayerData = {
  code?: string;
  monotonicF?: boolean;
  monotonicG?: boolean;
  breakpoints?: Breakpoint[];
  trace?: UploadedTrace;
};
export function useBreakpoints(key?: string) {
  const { layer } = useLayer<DebugLayerData>(key);
  const {monotonicF, monotonicG,breakpoints ,code,trace} = layer?.source??{}
  // TODO:
  return useMemo(() => {
    const memo = keyBy(trace?.content?.events, "id");
    return memoizee((step: number) => {
      const event = trace?.content?.events?.[step];
      if (event) {
        try {
          // Check monotonic f or g values
          if (step) {
            for (const p of [monotonicF && "f", monotonicG && "g"]) {
              if (p && get(memo[`${event.pId}`], p) > get(event, p)) {
                return { result: `Monotonicity violation on ${p}` };
              }
            }
          }
          // Check breakpoints in the breakpoints section
          for (const {
            active,
            condition,
            type,
            property = "",
            reference = 0,
          } of breakpoints??[]) {
            const isType = !type || type === event.type;
            const match = condition?.apply?.(get(event, property), reference);
            if (active && isType && match) {
              return {
                result: `${property} ${lower(
                  startCase(condition?.key)
                )} ${reference}`,
              };
            }
          }
          // Check breakpoints in the script editor section
          if (
            call(code ?? "", "shouldBreak", [
              step,
              event,
              trace?.content?.events?? [],
            ])
          ) {
            return { result: "Script editor" };
          }
        } catch (e) {
          return { error: `${e}` };
        }
      }
      return { result: "" };
    });
  }, [code, trace?.content, breakpoints, monotonicF, monotonicG]);

}

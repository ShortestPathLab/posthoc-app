import { call } from "components/script-editor/call";
import { transpile } from "components/script-editor/transpile";
import { get, lowerCase as lower, memoize, startCase } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

const EVAL = true;

export function useBreakpoints() {
  const [{ specimen }] = useSpecimen();
  const [{ code, breakpoints = [], monotonicF, monotonicG }] = useUIState();
  const es5 = useMemo(() => transpile(code), [code]) ?? "";

  return useMemo(
    () =>
      memoize(async (step: number) => {
        const event = specimen?.eventList?.[step];
        if (event) {
          try {
            // Check monotonic f or g values
            // TODO Fix definition of a monotonic f or g value
            if (step) {
              for (const p of [monotonicF && "f", monotonicG && "g"]) {
                const prev = specimen?.eventList?.[step - 1];
                if (p && get(prev, p) > get(event, p)) {
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
            } of breakpoints) {
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
            if (await call(es5, "shouldBreak", [step, event], false, EVAL)) {
              return { result: `Script editor` };
            }
          } catch (e) {
            return { error: `${e}` };
          }
        }
        return { result: "" };
      }),
    [es5, specimen, breakpoints, monotonicF, monotonicG]
  );
}

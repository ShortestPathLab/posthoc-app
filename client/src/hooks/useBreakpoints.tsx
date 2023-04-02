import { call } from "components/script-editor/call";
import { get, keyBy, lowerCase as lower, memoize, startCase } from "lodash";
import { useMemo } from "react";
import { useSpecimen } from "slices/specimen";
import { useUIState } from "slices/UIState";

export function useBreakpoints() {
  const [{ specimen }] = useSpecimen();
  const [{ code, breakpoints = [], monotonicF, monotonicG }] = useUIState();

  return useMemo(() => {
    const memo = keyBy(specimen?.eventList, "id");
    return memoize((step: number) => {
      const event = specimen?.eventList?.[step];
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
          if (
            call(code ?? "", "shouldBreak", [
              step,
              event,
              specimen?.eventList ?? [],
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
  }, [code, specimen, breakpoints, monotonicF, monotonicG]);
}

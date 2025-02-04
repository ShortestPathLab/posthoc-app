import { chain, debounce, isEmpty, isUndefined, keys, set } from "lodash";
import { useMemo } from "react";
import { Block } from "components/generic/Block";
import { TraceEventType } from "protocol";

import {
  BreakpointData,
  BreakpointHandler,
  DebugLayerData,
  useBreakPoints2,
} from "hooks/useBreakPoints2";
import { UploadedTrace } from "slices/UIState";
import { useLayer } from "slices/layers";
import { produce } from "produce";

export const breakpointType = [
  "Breakpoint",
  "Monotonicity",
  "Valid Parent",
  "Label out-of-bounds",
];

export const violations = [
  "Monotonicity",
  "Valid Parent",
  "Label out-of-bounds",
];

export type Breakpoint = {
  key: string;
  type?: string;
  property?: string;
  reference?: number;
  condition?: string;
  active?: boolean;
  eventType?: TraceEventType;
  label?: string;
};

type BreakpointEditorProps = {
  value: Breakpoint;
  layerKey?: string;
  trace?: UploadedTrace;
  onValueChange?: (v: any) => void;
  onResultChange?: (v: any) => void;
};

export function BreakpointEditor({
  value,
  layerKey,
  trace,
  onValueChange: onChange,
}: BreakpointEditorProps) {
  const { handlersCollection } = useBreakPoints2(layerKey);
  const { layer, setLayer } = useLayer<DebugLayerData>(layerKey);
  const properties = useMemo(
    () =>
      chain(trace?.content?.events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [trace?.content?.events]
  );

  async function handleChange(
    next: Partial<Breakpoint>,
    handler: BreakpointHandler<string, Partial<BreakpointData>>
  ) {
    // To do: debounce?
    const res = await handler.processor({ ...value, ...next }, trace!!);
    const resWithKey = { [value?.key]: res };
    if (!isEmpty(res) && !isUndefined(res) && layer) {
      setLayer(
        produce(layer, (layer) =>
          set(layer?.source ?? {}, "output", {
            ...layer?.source?.output,
            ...resWithKey,
          })
        )
      );
    }
    onChange?.({ ...value, ...next });
  }

  return (
    <Block alignItems="center" sx={{ py: 1 }}>
      {Object.entries(handlersCollection).map(([key, handler]) => {
        const label = value?.label ?? "Breakpoint";
        if (key === label)
          return Object.entries(handler.fields).map(([fieldKey, Field]) => {
            return (
              <div>
                <div key={fieldKey}>
                  <Field
                    properties={properties}
                    onChange={(v: any) => {
                      handleChange({ [fieldKey]: v }, handler as any);
                    }}
                    value={value?.[fieldKey as keyof Breakpoint] as any}
                    disabled={
                      fieldKey === "reference" && value?.condition === "changed"
                    }
                  />
                </div>
              </div>
            );
          });
      })}
    </Block>
  );
}

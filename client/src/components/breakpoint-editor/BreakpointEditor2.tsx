import { chain, keys } from "lodash";
import { useMemo } from "react";
import { Block } from "components/generic/Block";
import { TraceEventType } from "protocol";
import { UploadedTrace } from "slices/UIState";
import handlersCollection from "./BreakpointHandlers";
import { Box } from "@mui/material";

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

export type Breakpoint<InputsType extends unknown[] = unknown[]> = {
  key: string;
  type?: string;
  property?: string;
  reference?: number;
  condition?: string;
  active?: boolean;
  eventType?: TraceEventType;
  label?: string;
  inputs?: InputsType;
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
  const properties = useMemo(
    () =>
      chain(trace?.content?.events)
        .flatMap(keys)
        .uniq()
        .filter((p) => p !== "type")
        .value(),
    [trace?.content?.events]
  );

  async function handleChange(next: Partial<Breakpoint>) {
    onChange?.({ ...value, ...next });
  }

  return (
    <Block alignItems="center" sx={{ py: 1 }}>
      {Object.entries(handlersCollection).map(([key, handler]) => {
        const label = value?.label ?? "Breakpoint";
        if (key === label)
          return Object.entries(handler.fields).map(([fieldKey, Field]) => {
            return (
              <Box key={fieldKey}>
                <Field
                  properties={properties}
                  onChange={(v: any) => {
                    handleChange({ [fieldKey]: v });
                  }}
                  value={value?.[fieldKey as keyof Breakpoint] as any}
                  disabled={
                    fieldKey === "reference" && value?.condition === "changed"
                  }
                />
              </Box>
            );
          });
      })}
    </Block>
  );
}

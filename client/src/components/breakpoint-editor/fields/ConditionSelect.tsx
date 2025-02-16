import { SelectField as Select } from "components/generic/inputs/Select";
import { head, startCase } from "lodash";
import { BreakpointFieldProps } from "../breakpoints/Breakpoint";

export const ConditionSelect = (props: BreakpointFieldProps<string>) => {
  return (
    <Select
      disabled={props.disabled}
      sx={{ minWidth: 160 }}
      variant="outlined"
      placeholder="Condition"
      items={props.conditions?.map((c) => ({
        value: c,
        label: startCase(c),
      }))}
      value={props.value ?? head(props.conditions) ?? ""}
      onChange={(v) => {
        props.onChange?.(v);
      }}
    />
  );
};
